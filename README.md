# Woodhouse Blending & Brewing website

Static site on Vercel. Squarespace stays on as the editor for events and blog posts;
two small functions in `api/` read them and the homepage shows them automatically.

```
index.html          the whole site
img/                photos, wordmark, crest
favicon.svg         the W mark
api/events.js       reads Squarespace events  ->  /api/events
api/news.js         reads Squarespace blog    ->  /api/news
api/_squarespace.js shared helper (not a route)
vercel.json         caching + redirects from old Squarespace URLs
cellar-setup.sql    one-time setup for the live cellar (brewing app's Supabase)
```

Settings (Vercel, Project, Settings, Environment Variables):

| Name | Value |
|---|---|
| SQUARESPACE_ORIGIN | the Squarespace site's own address, e.g. https://woodhouse-xyz.squarespace.com |
| SQUARESPACE_EVENTS_PATH | /events (default) |
| SQUARESPACE_BLOG_PATH | /news (default) |

Editing content: events and posts in Squarespace as usual (shows up within 5 minutes).
Menu, hours and the beer archive are the `MENU`, `HOURS` and archive lists in index.html.
