export async function POST(request: Request) {
  const { queryString } = await request.json();

  if (!queryString) {
    return Response.json({ error: "queryString is required" }, { status: 400 });
  }

  const makeRes = await fetch(process.env.MAKE_WEBHOOK_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ queryString }),
  });

  if (!makeRes.ok) {
    return Response.json({ error: "Make webhook failed" }, { status: 500 });
  }

  return Response.json({
    success: true,
    queryString,
    message: "Search triggered. Results will appear in Airtable shortly.",
  });
}
