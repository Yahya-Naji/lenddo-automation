export async function POST(request: Request) {
  const { queryStrings } = await request.json();

  if (!queryStrings || !Array.isArray(queryStrings) || queryStrings.length === 0) {
    return Response.json({ error: "queryStrings is required" }, { status: 400 });
  }

  const results = await Promise.all(
    queryStrings.map((queryString: string) =>
      fetch(process.env.N8N_WEBHOOK_URL!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queryString }),
      })
    )
  );

  const failed = results.filter((r) => !r.ok);
  if (failed.length > 0) {
    return Response.json({ error: "Make webhook failed" }, { status: 500 });
  }

  return Response.json({
    success: true,
    message: `${queryStrings.length} search${queryStrings.length > 1 ? "es" : ""} triggered. Results will appear in Airtable shortly.`,
  });
}
