export async function POST(request: Request) {
  const { query } = await request.json();

  if (!query || query.length < 2) {
    return Response.json({ companies: [], titlesPerCompany: {} });
  }

  const res = await fetch("https://api.apollo.io/api/v1/mixed_people/api_search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": process.env.APOLLO_PEOPLE_API_KEY!,
    },
    body: JSON.stringify({
      q_organization_name: query,
      per_page: 100,
      page: 1,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("Apollo company search error:", res.status, errorBody);
    return Response.json({ error: "Company search failed", detail: errorBody }, { status: 500 });
  }

  const data = await res.json();
  const people: Record<string, unknown>[] = data.people || [];

  const companiesMap = new Map<string, { id: string; name: string; domain: string }>();
  const titlesPerCompany = new Map<string, Set<string>>();

  for (const person of people) {
    const org = person.organization as Record<string, string> | null;
    if (!org?.name) continue;

    const key = org.name;

    if (!companiesMap.has(key)) {
      companiesMap.set(key, {
        id: key,
        name: org.name,
        domain: org.primary_domain || org.website_url || "",
      });
    }

    if (!titlesPerCompany.has(key)) {
      titlesPerCompany.set(key, new Set());
    }

    if (person.title) {
      titlesPerCompany.get(key)!.add(person.title as string);
    }
  }

  return Response.json({
    companies: Array.from(companiesMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
    titlesPerCompany: Object.fromEntries(
      Array.from(titlesPerCompany.entries()).map(([id, titles]) => [id, Array.from(titles).sort()])
    ),
  });
}
