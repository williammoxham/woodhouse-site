// POST /api/subscribe { email } -> adds the address to Square Customers (Customer Directory),
// tagged so you can find website signups and email them from Square Marketing.
const { sq } = require('./_square');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'POST') return res.status(405).send('{"ok":false}');
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const email = String(body.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return res.status(400).send('{"ok":false,"error":"invalid"}');
    const found = await sq('/v2/customers/search', { query: { filter: { email_address: { exact: email } } }, limit: 1 });
    if (!(found.customers && found.customers.length)) {
      await sq('/v2/customers', { email_address: email, reference_id: 'website-signup', note: 'Joined Woodhouse updates on woodhousebrews.com', idempotency_key: 'web-' + Buffer.from(email).toString('base64').slice(0, 40) });
    }
    res.status(200).send('{"ok":true}');
  } catch (err) {
    res.status(200).send(JSON.stringify({ ok: false, error: String(err.message || err) }));
  }
};
