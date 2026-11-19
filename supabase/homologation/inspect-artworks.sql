-- Read-only inventory. Run in vyrtua-print-dev.
-- An unlinked file may still belong to an upload whose order is in flight.
-- This query intentionally excludes recently created objects.
select
  object.name as artwork_path,
  object.created_at
from storage.objects as object
where object.bucket_id = 'print-artworks'
  and object.created_at < now() - interval '24 hours'
  and not exists (
    select 1 from print.orders as orders
    where orders.artwork_path = object.name
  )
order by object.created_at, object.name;
