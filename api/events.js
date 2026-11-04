// GET /api/events  ->  { events: [{ title, start, end, url, excerpt, image }], calendarUrl }
const { ORIGIN, strip, clip, abs, getJson, send } = require('./_squarespace');
const PATH = process.env.SQUARESPACE_EVENTS_PATH || '/events';

module.exports = async (req, res) => {
  try {
    const data = await getJson(PATH);
    const list = data.upcoming || data.items || [];
    const events = list
      .filter((e) => e.startDate)
      .map((e) => ({
        title: strip(e.title),
        start: e.startDate,
        end: e.endDate || e.startDate,
        url: abs(e.fullUrl),
        excerpt: clip(strip(e.excerpt || e.body || '')),
        image: e.assetUrl ? e.assetUrl + '?format=750w' : '',
      }));
    send(res, { events, calendarUrl: ORIGIN + PATH });
  } catch (err) {
    send(res, { events: [], error: String(err.message || err) });
  }
};
