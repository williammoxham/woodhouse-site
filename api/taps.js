// GET /api/taps -> what's pouring, read from Square.
// "On tap" = drinks that actually sold at the bar in the last 7 days, grouped by category.
const { sq, LOCATION } = require('./_square');

const GROUPS = [
  { key: 'house', label: 'Woodhouse Beer' },
  { key: 'guest', label: 'Guest Taps' },
  { key: 'spritz', label: 'Spritzes & Seltzers' },
  { key: 'kombucha', label: 'Hard Kombucha' },
  { key: 'cider', label: 'Cider' },
  { key: 'wine', label: 'Wine' },
  { key: 'na', label: 'Non-Alcoholic' },
];
const SKIP = /gift card|to go|add chicken|merch|tip/i;

function groupFor(catNames, name) {
  const c = catNames.join('|').toLowerCase();
  if (/food|kitchen|merch/.test(c) && !/beer|wine|cider|drink|kombucha/.test(c)) return null;
  if (/spritz|seltzer/i.test(name)) return 'spritz';
  if (/beer \(purchased\)/.test(c)) return 'guest';
  if (/kombucha/.test(c)) return 'kombucha';
  if (/cider/.test(c)) return 'cider';
  if (/wine/.test(c)) return 'wine';
  if (/na drink/.test(c)) return 'na';
  if (/beer/.test(c)) return 'house';
  return null;
}
function parseDesc(d = '') {
  const abv = (d.match(/(\d+(?:\.\d+)?)\s*%/) || [])[1];
  const style = d.split(/\s+-\s+|\s+\d/)[0].trim();
  return { abv: abv ? +abv : null, style, desc: d.replace(/\s+-\s+/g, ' · ').trim() };
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
    // 1) everything sold in the last 7 days
    const since = new Date(Date.now() - 7 * 864e5).toISOString();
    const sold = new Map(); // variationId -> qty
    let cursor, pages = 0;
    do {
      const j = await sq('/v2/orders/search', {
        location_ids: [LOCATION], limit: 500, cursor,
        query: { filter: { date_time_filter: { closed_at: { start_at: since } }, state_filter: { states: ['COMPLETED'] } } },
      });
      (j.orders || []).forEach((o) => (o.line_items || []).forEach((li) => {
        if (li.catalog_object_id) sold.set(li.catalog_object_id, (sold.get(li.catalog_object_id) || 0) + Number(li.quantity || 1));
      }));
      cursor = j.cursor; pages++;
    } while (cursor && pages < 8);

    // 2) look up those variations, their items and categories
    const ids = [...sold.keys()];
    const objects = [], related = [];
    for (let i = 0; i < ids.length; i += 900) {
      const j = await sq('/v2/catalog/batch-retrieve', { object_ids: ids.slice(i, i + 900), include_related_objects: true });
      objects.push(...(j.objects || [])); related.push(...(j.related_objects || []));
    }
    const cats = {};
    const catList = await sq('/v2/catalog/list?types=CATEGORY');
    (catList.objects || []).forEach((c) => (cats[c.id] = c.category_data.name));
    const items = {};
    related.filter((o) => o.type === 'ITEM').forEach((o) => (items[o.id] = o));

    // 3) build the menu
    const byItem = {};
    objects.filter((o) => o.type === 'ITEM_VARIATION').forEach((v) => {
      const it = items[v.item_variation_data.item_id]; if (!it) return;
      const d = it.item_data; if (SKIP.test(d.name)) return;
      const catNames = (d.categories || []).map((c) => cats[c.id] || '').concat(d.reporting_category ? [cats[d.reporting_category.id] || ''] : []);
      const g = groupFor(catNames, d.name); if (!g) return;
      const e = byItem[it.id] || (byItem[it.id] = { group: g, name: d.name, color: d.label_color ? '#' + d.label_color : '', sold: 0, soldVariations: new Set(), ...parseDesc(d.description_plaintext || d.description || ''),
        sizes: (d.variations || []).map((x) => [x.item_variation_data.name, x.item_variation_data.price_money ? x.item_variation_data.price_money.amount : null]) });
      e.sold += sold.get(v.id) || 0; e.soldVariations.add(v.item_variation_data.name);
    });
    const groups = GROUPS.map((g) => ({ key: g.key, label: g.label, items: Object.values(byItem).filter((i) => i.group === g.key)
      .sort((a, b) => b.sold - a.sold)
      .map((i) => {
        // wine, cider and NA: show what actually poured (e.g. "Red", "Scrumpy Draft")
        const multi = ['wine', 'cider', 'na'].includes(i.group);
        return { name: i.name, desc: i.desc, style: i.style, abv: i.abv, color: i.color,
          poured: multi ? [...i.soldVariations] : undefined,
          sizes: multi ? i.sizes.filter((s) => i.soldVariations.has(s[0])) : i.sizes };
      }) })).filter((g) => g.items.length);

    res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600');
    res.status(200).send(JSON.stringify({ updated: new Date().toISOString(), groups }));
  } catch (err) {
    res.status(200).send(JSON.stringify({ groups: [], error: String(err.message || err) }));
  }
};
