-- Run only in vyrtua-print-dev. Replace both addresses with the dedicated
-- confirmed accounts from Supabase Auth before executing.
do $$
declare
  emails text[] := array['replace-a@example.invalid', 'replace-b@example.invalid'];
  tenants uuid[] := array['bfb33558-2f19-4656-85ac-d503d98084db', 'fc950004-1667-4b40-8ba4-77e9f3f142f9'];
  products uuid[] := array['26894fc6-87df-4ae3-b190-369ffbfc268f', '2c705599-d15a-4907-8ea8-f189bf4e6e28'];
  account_id uuid;
  company_name text;
begin
  if lower(emails[1]) = lower(emails[2]) or exists (
    select 1 from unnest(emails) as e(addr) where e.addr like '%@example.invalid'
  ) then
    raise exception 'Informe dois e-mails distintos das contas de homologação.';
  end if;

  for i in 1..2 loop
    select id into strict account_id from auth.users
    where lower(email) = lower(emails[i]) and email_confirmed_at is not null;
    company_name := 'VYRTUA PRINT · Homologação ' || chr(64 + i);

    if exists (select 1 from print.memberships where user_id = account_id and company_id <> tenants[i])
       or exists (select 1 from print.memberships where company_id = tenants[i] and user_id <> account_id)
       or exists (select 1 from print.companies where id = tenants[i] and name <> company_name) then
      raise exception 'Conta ou empresa já possui vínculos fora da homologação.';
    end if;

    insert into print.companies(id, name) values (tenants[i], company_name)
    on conflict (id) do nothing;
    insert into print.memberships(company_id, user_id, role)
    values (tenants[i], account_id, 'owner')
    on conflict (company_id, user_id) do update set role = excluded.role;
    insert into print.products(company_id, id, name, price_cents, active)
    values (tenants[i], products[i], 'Camiseta de homologação', 2500, true)
    on conflict (company_id, id) do nothing;
  end loop;
end;
$$;
