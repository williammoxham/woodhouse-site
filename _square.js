// Shared Square helper. Needs SQUARE_ACCESS_TOKEN (and SQUARE_LOCATION_ID) in Vercel env vars.
const BASE = process.env.SQUARE_ENV === 'sandbox' ? 'https://connect.squareupsandbox.com' : 'https://connect.squareup.com';
const TOKEN = process.env.SQUARE_ACCESS_TOKEN || '';
const LOCATION = process.env.SQUARE_LOCATION_ID || 'V90WW1EQSH926';

async function sq(path, body, method) {
  if (!TOKEN) throw new Error('SQUARE_ACCESS_TOKEN not set');
  const r = await fetch(BASE + path, {
    method: method || (body ? 'POST' : 'GET'),
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json', 'Square-Version': '2025-01-23' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((j.errors && j.errors[0] && j.errors[0].detail) || 'Square ' + r.status);
  return j;
}
module.exports = { sq, LOCATION, hasToken: () => !!TOKEN };
