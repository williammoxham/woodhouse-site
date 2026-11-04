-- Woodhouse website: live cellar feed
-- Run this in the brewing app's Supabase project (SQL editor).
-- It exposes ONE read-only view to the public website. Nothing else
-- (recipes, costs, ordering, brew sheets) becomes readable.
--
-- The website expects these columns, one row per tank:
--   tank_code    text     'FV1','FV2','FV3','FV4','P1','P2','BT2','BT3','BT4','B20'
--   beer_name    text     null when empty
--   style        text     e.g. 'Hazy IPA' (also drives the beer color in 3D)
--   status       text     'fermenting' | 'conditioning' | 'ready' | 'empty' | 'cleaning'
--   fill_pct     numeric  0 to 100
--   brewed_on    date
--   ready_on     date     estimated on-tap date
--   abv_target   numeric  optional
--
-- Replace the table and column names on the right side below with the
-- ones the brewing app actually uses. The names here are placeholders.

create or replace view public.public_cellar as
select
  t.code                         as tank_code,
  b.beer_name                    as beer_name,
  b.style                        as style,
  coalesce(b.status, case when t.is_cleaning then 'cleaning' else 'empty' end) as status,
  round(coalesce(b.volume_bbl / nullif(t.capacity_bbl, 0) * 100, 0)) as fill_pct,
  b.brew_date                    as brewed_on,
  b.est_ready_date               as ready_on,
  b.target_abv                   as abv_target
from tanks t
left join lateral (
  select *
  from batches
  where batches.tank_id = t.id
    and batches.status in ('fermenting', 'conditioning', 'ready')
  order by batches.brew_date desc
  limit 1
) b on true;

-- Public read access to the view only.
-- (A view runs with its owner's rights, so the base tables stay locked by RLS.)
revoke all on public.public_cellar from anon;
grant select on public.public_cellar to anon;

-- Then on the website, set in index.html:
--   const CELLAR_SOURCE = { url: 'https://YOUR-PROJECT.supabase.co',
--                           anonKey: 'YOUR-ANON-KEY', view: 'public_cellar',
--                           refreshMinutes: 5 };
-- The anon key is safe to ship in the browser; it can only read this view.
