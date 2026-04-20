export async function POST(request: Request) {
  const { query } = await request.json();

  if (!query || query.length < 2) {
    return Response.json({ companies: [], titlesPerCompany: {} });
  }

  const res = await fetch(
    `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(query)}`
  );

  if (!res.ok) {
    return Response.json({ error: "Company search failed" }, { status: 500 });
  }

  const data = await res.json();

  const seen = new Set<string>();
  const companies = data
    .filter((org: { name: string; domain: string }) => {
      if (!org.domain) return false;
      const nameKey = org.name.toLowerCase().split(/[\s,&]/)[0];
      if (seen.has(nameKey)) return false;
      seen.add(nameKey);
      return true;
    })
    .map((org: { name: string; domain: string }) => ({
      id: org.domain,
      name: org.name,
      domain: org.domain,
    }));

  return Response.json({ companies, titlesPerCompany: {} });
}
