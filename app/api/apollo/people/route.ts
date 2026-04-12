export async function POST(request: Request) {
  const { organizationId, domain, locations } = await request.json();

  if (!organizationId && !domain && !locations) {
    return Response.json({ error: "organizationId, domain, or locations required" }, { status: 400 });
  }

  const searchBody: Record<string, unknown> = { per_page: 100, page: 1 };

  if (locations) {
    searchBody["person_locations"] = locations;
  } else {
    if (organizationId) searchBody["organization_ids"] = [organizationId];
    if (domain) searchBody["q_organization_domains_list"] = [domain];
  }

  const res = await fetch("https://api.apollo.io/api/v1/mixed_people/api_search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": process.env.APOLLO_PEOPLE_API_KEY!,
    },
    body: JSON.stringify(searchBody),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("Apollo people error:", res.status, errorBody);
    return Response.json({ error: "Apollo people search failed", detail: errorBody }, { status: 500 });
  }

  const data = await res.json();
  const people: Record<string, unknown>[] = data.people || [];

  if (locations) {
    // Location-first: extract unique companies and their titles
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
  } else {
    // Company-first: extract titles and locations
    const titlesSet = new Set<string>();
    const locationsSet = new Set<string>();

    for (const person of people) {
      if (person.title) titlesSet.add(person.title as string);
      const parts = [person.city, person.state, person.country].filter(Boolean) as string[];
      if (parts.length > 0) locationsSet.add(parts.join(", "));
    }

    return Response.json({
      titles: Array.from(titlesSet).sort(),
      locations: Array.from(locationsSet).sort(),
    });
  }
}
