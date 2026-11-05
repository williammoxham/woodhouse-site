# Woodhouse Blending & Brewing website

Static multi-page site on Vercel. No build step. Squarespace stays on as the editor
for events and blog posts; the functions in `api/` read them and the site shows them.

```
index.html          Home
calendar.html       On the Calendar: shows, artists, stage info, press kit
beer.html           From the Cellar: live 3D cellar, taps, pint, process, brewers, history
kitchen.html        Kitchen: menu and catering
events.html         Private events: event types, spaces, sizer, FAQ, brochure
assets/js/data.js   <- EDIT THIS for hours, menu, taps, artists, contacts, cellar connection
assets/js/*.js      page scripts (core.js runs on every page)
assets/css/site.css all styles
img/                photos and brand art
downloads/          events brochure (add woodhouse-press-kit.pdf here to turn on that button)
api/                events + news readers for Squarespace
vercel.json         caching + redirects from old Squarespace URLs
cellar-setup.sql    one-time setup for the live cellar (brewing app's Supabase)
```

## Everyday edits
- Hours, food menu, tap list, other drinks, beer archive, artist wall, contact emails:
  `assets/js/data.js`. Commit and Vercel redeploys in about 30 seconds.
- Events and blog posts: add them in Squarespace as usual. They appear within 5 minutes.
- Press kit: upload `woodhouse-press-kit.pdf` into `downloads/`. Until then the button
  becomes a "Request the press kit" email link.

## Settings (Vercel, Project, Settings, Environment Variables)
| Name | Value |
|---|---|
| SQUARESPACE_ORIGIN | only needed after woodhousebrews.com moves to Vercel: the Squarespace site's own `.squarespace.com` address |
| SQUARESPACE_EVENTS_PATH | /events (default) |
| SQUARESPACE_BLOG_PATH | /news (default) |

## Square (tap list + email signups)
The Beer page tap list reads what actually sold at the bar in the last 7 days, and the
footer signup adds people to your Square Customer Directory (tagged `website-signup`).
1. developer.squareup.com > Applications > + New application (name it "Woodhouse website").
2. Open it > Production > copy the **Production Access Token**.
3. Vercel > Project > Settings > Environment Variables: add `SQUARE_ACCESS_TOKEN` = that token,
   and `SQUARE_LOCATION_ID` = `V90WW1EQSH926`. Redeploy.
The token stays on the server (in the `api/` functions); it never reaches visitors' browsers.

## Live cellar
1. Run `cellar-setup.sql` in the brewing app's Supabase (match the table names to the app).
2. Put the Supabase URL and anon key in `CELLAR_SOURCE` in `assets/js/data.js`.
