// GET /api/events  ->  { events: [...upcoming], past: [...recent], calendarUrl }
// Each event: { title, start, end, url, excerpt, body, image, tags, categories }
const { ORIGIN, strip, clip, abs, getJson, send } = require('./_squarespace');
const PATH = process.env.SQUARESPACE_EVENTS_PATH || '/events';

const bodyText = (html = '') =>
  String(html).replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|h\d|li)>/gi, '\n').replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();

// The event's own photo: its thumbnail, or else the first image in its description (flyers usually live there).
const sized = (u) => (u ? u.split('?')[0] + '?format=750w' : '');
const imageOf = (e) => {
  if (e.assetUrl && !/\/static\/|placeholder/i.test(e.assetUrl)) return sized(e.assetUrl);
  const html = String(e.body || '');
  const m = html.match(/<img[^>]+data-src="(https?:[^"]+)"/i) || html.match(/<img[^>]+src="(https?:[^"]+)"/i) ||
    html.match(/data-image="(https?:[^"]+)"/i);
  return sized(m ? m[1].replace(/&amp;/g, '&') : (e.assetUrl || ''));
};

const shape = (e) => ({
  title: strip(e.title),
  start: e.startDate,
  end: e.endDate || e.startDate,
  url: abs(e.fullUrl),
  excerpt: clip(strip(e.excerpt || e.body || ''), 220),
  body: clip(bodyText(e.body), 1600),
  image: imageOf(e),
  tickets: ((String(e.body || '').match(/<a[^>]+href="(https?:[^"]+)"[^>]*>(?:(?!<\/a>)[\s\S])*?(?:ticket|rsvp|buy|register)(?:(?!<\/a>)[\s\S])*?<\/a>/i)) || [])[1] ||
    ((String(e.body || '').match(/href="(https?:[^"]*(?:eventbrite|fareharbor|ticket|tix|dice\.fm|seetickets|universe\.com)[^"]*)"/i)) || [])[1] || '',
  tags: e.tags || [],
  categories: e.categories || [],
});

module.exports = async (req, res) => {
  try {
    const data = await getJson(PATH);
    const upcoming = (data.upcoming || data.items || []).filter((e) => e.startDate).map(shape);
    const past = (data.past || []).filter((e) => e.startDate).slice(0, 40).map(shape);
    send(res, { events: upcoming, past, calendarUrl: ORIGIN + PATH });
  } catch (err) {
    send(res, { events: [], past: [], error: String(err.message || err) });
  }
};
