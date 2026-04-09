/**
 * Convert a filters object into an Apollo-style query string.
 * Arrays become repeated keys with [] suffix, e.g. person_titles[]=a&person_titles[]=b
 */
function filtersToQueryString(filters: Record<string, unknown>): string {
  const parts: string[] = [];

  for (const [key, value] of Object.entries(filters)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        parts.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(String(item))}`);
      }
    } else if (value !== undefined && value !== null) {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }

  return parts.join("&");
}

export async function POST(request: Request) {
  const { query, source } = await request.json();

  if (!query) {
    return Response.json({ error: "Query is required" }, { status: 400 });
  }

  // Step 1: Call OpenAI to parse NL → Apollo filters
  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You convert natural language lead search queries into Apollo.io API filters. Return ONLY a JSON object with these possible keys:

- person_locations: array of locations (e.g. ["United Arab Emirates", "Dubai"])
- person_seniorities: array from: entry, senior, manager, director, vp, c_suite
- person_titles: array of job titles (only if specific titles mentioned)
- q_keywords: keyword string (use OR for multiple, e.g. "finance OR banking")
- organization_num_employees_ranges: array of ranges like "51,200", "201,500", "501,1000", "1001,5000"
- q_organization_domains_list: array of company domains (only if specific companies mentioned, e.g. ["kearney.com"])
- per_page: number 25

Context: We are looking for people in the UAE who are likely to NEED a mortgage — high earners, expats, senior professionals. NOT people who work in mortgages.

Always include person_locations with at least "United Arab Emirates". Default to manager+ seniority if not specified. Default per_page to 25.`,
        },
        {
          role: "user",
          content: query,
        },
      ],
    }),
  });

  if (!openaiRes.ok) {
    const err = await openaiRes.text();
    return Response.json({ error: "OpenAI parsing failed", details: err }, { status: 500 });
  }

  const openaiData = await openaiRes.json();
  const filters = JSON.parse(openaiData.choices[0].message.content);

  // Step 2: Convert filters to query string and POST to Make webhook
  const queryString = filtersToQueryString(filters);

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
    query,
    source,
    filters,
    queryString,
    message: "Search triggered. Results will appear in Airtable shortly.",
  });
}
