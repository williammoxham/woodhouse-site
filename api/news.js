// GET /api/news  ->  { posts: [{ title, date, url, excerpt, image }] }
const { strip, clip, abs, getJson, getRss, send } = require('./_squarespace');
const bodyText = (html = '') =>
  String(html).replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|h\d|li)>/gi, '\n').replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
const PATH = process.env.SQUARESPACE_BLOG_PATH || '/news';

module.exports = async (req, res) => {
  try {
    let posts;
    try {
      const data = await getJson(PATH);
      posts = (data.items || []).map((p) => ({
        title: strip(p.title),
        date: p.publishOn || p.addedOn,
        url: abs(p.fullUrl),
        excerpt: clip(strip(p.excerpt || p.body || '')),
        body: clip(bodyText(p.body || p.excerpt || ''), 4000),
        image: (() => { const m = String(p.body || '').match(/<img[^>]+(?:data-src|src)="(https?:[^"]+)"/i); const u = p.assetUrl || (m ? m[1].replace(/&amp;/g, '&') : ''); return u ? u.split('?')[0] + '?format=750w' : ''; })(),
      }));
    } catch {
      posts = (await getRss(PATH)).map((p) => ({ ...p, excerpt: clip(strip(p.html)), body: clip(bodyText(p.html), 4000), html: undefined }));
    }
    send(res, { posts: posts.filter((p) => p.title).slice(0, 6) });
  } catch (err) {
    send(res, { posts: [], error: String(err.message || err) });
  }
};
