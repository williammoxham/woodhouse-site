-- Woodhouse website: live cellar feed (read only)
-- Run in the brewing app's Supabase project (SQL editor). It exposes ONE view to the
-- public website. Recipes, notes, costs, ordering and brew sheet internals stay private.
--
-- One row per vessel. tank_code must match the website layout:
--   HLT, MLT, BK, FV1..FV6, BT1..BT4, B1..B12
-- status (same set as the brewing app):
--   brewing | fermenting | conditioning | cold_crash | carbonating | ready | serving | aging | empty
--
-- Replace the table and column names on the right with the ones the brewing app uses.

create or replace view public.public_cellar as
select
  t.code                                   as tank_code,
  coalesce(b.status, 'empty')              as status,
  b.beer_name                              as beer_name,
  b.style                                  as style,
  b.batch_number::text                     as batch,
  b.volume_bbl                             as volume_bbl,
  (current_date - b.brew_date)             as day,
  b.brew_date                              as brewed_on,
  b.est_ready_date                         as ready_on,
  b.og                                     as og,
  b.current_sg                             as sg,
  b.target_fg                              as fg_target,
  b.target_abv                             as abv_target,
  b.ibu                                    as ibu,
  b.tank_temp_f                            as temp_f,
  b.yeast                                  as yeast,
  b.hops_summary                           as hops,
  b.malt_summary                           as malt,
  -- gravity readings for the little chart: [[date, sg], ...]
  (select json_agg(json_build_array(r.taken_on, r.sg) order by r.taken_on)
     from gravity_readings r where r.batch_id = b.id)  as readings,
  t.next_planned_beer                      as next_beer
from tanks t
left join lateral (
  select * from batches
  where batches.tank_id = t.id and batches.status <> 'packaged'
  order by batches.brew_date desc limit 1
) b on true;

revoke all on public.public_cellar from anon;
grant select on public.public_cellar to anon;

-- Then in assets/js/data.js:
--   CELLAR_SOURCE: { url: 'https://YOUR-PROJECT.supabase.co', anonKey: 'YOUR-ANON-KEY',
--                    view: 'public_cellar', refreshMinutes: 5 }
