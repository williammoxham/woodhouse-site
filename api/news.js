// GET /api/news  ->  { posts: [{ title, date, url, excerpt, image }] }
const { strip, clip, abs, getJson, getRss, send } = require('./_squarespace');
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
        image: p.assetUrl ? p.assetUrl + '?format=750w' : '',
      }));
    } catch {
      posts = (await getRss(PATH)).map((p) => ({ ...p, excerpt: clip(strip(p.html)), html: undefined }));
    }
    send(res, { posts: posts.filter((p) => p.title).slice(0, 6) });
  } catch (err) {
    send(res, { posts: [], error: String(err.message || err) });
  }
};
