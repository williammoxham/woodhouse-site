// Shared helpers: read a Squarespace collection as JSON, with RSS as a fallback.
// SQUARESPACE_ORIGIN must be the Squarespace site's own address (for example
// https://woodhouse.squarespace.com), NOT woodhousebrews.com once that points here.
const ORIGIN = (process.env.SQUARESPACE_ORIGIN || 'https://www.woodhousebrews.com').replace(/\/$/, '');

const strip = (html = '') =>
  String(html).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&#39;|&rsquo;/g, "'").replace(/&quot;|&ldquo;|&rdquo;/g, '"').replace(/\s+/g, ' ').trim();

const clip = (t, n = 180) => (t.length > n ? t.slice(0, n).replace(/\s+\S*$/, '') + '...' : t);
const abs = (u) => (!u ? '' : u.startsWith('http') ? u : ORIGIN + u);

async function getJson(path) {
  const r = await fetch(`${ORIGIN}${path}${path.includes('?') ? '&' : '?'}format=json`, {
    headers: { 'User-Agent': 'woodhouse-site/1.0', Accept: 'application/json' },
  });
  if (!r.ok) throw new Error(`Squarespace ${r.status}`);
  const type = r.headers.get('content-type') || '';
  if (!type.includes('json')) throw new Error('Not JSON');
  return r.json();
}

async function getRss(path) {
  const r = await fetch(`${ORIGIN}${path}?format=rss`, { headers: { 'User-Agent': 'woodhouse-site/1.0' } });
  if (!r.ok) throw new Error(`RSS ${r.status}`);
  const xml = await r.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, it]) => {
    const tag = (n) => (it.match(new RegExp(`<${n}[^>]*>([\\s\\S]*?)</${n}>`)) || [])[1] || '';
    const cdata = (t) => t.replace(/^<!\[CDATA\[|\]\]>$/g, '');
    const img = (it.match(/<media:content[^>]+url="([^"]+)"/) || it.match(/<img[^>]+src="([^"]+)"/) || [])[1] || '';
    return { title: strip(cdata(tag('title'))), url: strip(tag('link')), date: Date.parse(tag('pubDate')), html: cdata(tag('description')), image: img };
  });
}

function send(res, body) {
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).send(JSON.stringify(body));
}

module.exports = { ORIGIN, strip, clip, abs, getJson, getRss, send };
