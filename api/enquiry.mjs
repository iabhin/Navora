const SHEET_URL = process.env.SHEET_WEBAPP_URL || "";

export async function handleEnquiry(method, body) {
  if (method === "GET") {
    return { status: 200, body: { ready: Boolean(SHEET_URL) } };
  }
  if (method !== "POST") {
    return { status: 405, body: { ok: false } };
  }

  const data = body && typeof body === "object" ? body : {};
  if (data.company) return { status: 200, body: { ok: true, ignored: true } };

  const name = String(data.name || "").trim();
  const phone = String(data.phone || "").replace(/\D/g, "");
  if (name.length < 2) return { status: 400, body: { ok: false, error: "name" } };
  if (phone.length < 10 || phone.length > 15) return { status: 400, body: { ok: false, error: "phone" } };
  if (!SHEET_URL) return { status: 200, body: { ok: false, error: "sheet_not_connected" } };

  const upstream = await fetch(SHEET_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      name,
      phone: String(data.phone || "").trim(),
      email: String(data.email || "").trim(),
      city: String(data.city || "").trim(),
      country: String(data.country || "").trim(),
      intake: String(data.intake || "").trim(),
      course: String(data.course || "").trim(),
      message: String(data.message || "").trim(),
    }),
  });

  const text = await upstream.text();
  let parsed = {};
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    parsed = {};
  }
  const ok = upstream.ok && parsed.ok !== false;
  return { status: ok ? 200 : 502, body: { ok } };
}

export default async function handler(req, res) {
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch (err) {
      body = {};
    }
  }
  const result = await handleEnquiry(req.method, body || {});
  res.status(result.status).json(result.body);
}
