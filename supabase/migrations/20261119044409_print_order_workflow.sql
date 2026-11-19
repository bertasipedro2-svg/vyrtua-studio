create index orders_company_created_idx on print.orders (company_id, created_at desc, id desc);
revoke update on print.products from authenticated;
grant update (name, price_cents, active) on print.products to authenticated;
grant update (status, quote_cents) on print.orders to authenticated;

create policy order_update on print.orders for update to authenticated
using (exists (select 1 from print.memberships m where m.company_id = orders.company_id and m.user_id = (select auth.uid())))
with check (exists (select 1 from print.memberships m where m.company_id = orders.company_id and m.user_id = (select auth.uid())));

create function print.validate_order_transition() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare
  member_role text;
begin
  select m.role into member_role from print.memberships m
  where m.company_id = old.company_id and m.user_id = (select auth.uid());

  if member_role is null then
    raise exception 'Membership required' using errcode = '42501';
  end if;

  if not coalesce(
    (old.status = 'draft' and new.status = 'requested')
    or (member_role = 'owner' and (
      (old.status = 'requested' and new.status = 'quoted')
      or (old.status = 'quoted' and new.status = 'approved')
      or (old.status in ('draft', 'requested', 'quoted', 'approved') and new.status = 'cancelled')
    ))
    or (old.status = 'approved' and new.status = 'in_production')
    or (old.status = 'in_production' and new.status = 'ready')
    or (old.status = 'ready' and new.status = 'completed'), false)
  then
    raise exception 'Order transition not permitted' using errcode = '42501';
  end if;

  if new.status = 'quoted' then
    if new.quote_cents is null or new.quote_cents <= 0 then
      raise exception 'Positive quote required' using errcode = '23514';
    end if;
  elsif new.quote_cents is distinct from old.quote_cents then
    raise exception 'Quote can only be set when issued' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger validate_order_transition before update on print.orders
for each row execute function print.validate_order_transition();
revoke execute on function print.validate_order_transition() from public, anon, authenticated;

create function print.order_summary(tenant uuid) returns table (
  open_orders bigint, production_orders bigint, quoted_cents bigint, completed_cents bigint
) language sql stable security invoker set search_path = '' as $$
  select
    count(*) filter (where status not in ('completed','cancelled')),
    count(*) filter (where status in ('in_production','ready')),
    coalesce(sum(quote_cents) filter (where status = 'quoted'), 0),
    coalesce(sum(quote_cents) filter (where status = 'completed'), 0)
  from print.orders
  where company_id = tenant;
$$;
revoke execute on function print.order_summary(uuid) from public, anon;
grant execute on function print.order_summary(uuid) to authenticated;
