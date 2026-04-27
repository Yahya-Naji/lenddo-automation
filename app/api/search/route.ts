import { waitUntil } from "@vercel/functions";

const BATCH_SIZE = 25;

interface Filters {
  companyDomains: string[];
  jobTitles: string[];
  locations: string[];
  cities: string[];
}

export async function POST(request: Request) {
  const { totalLeads, filters }: { totalLeads: number; filters: Filters } =
    await request.json();

  if (!totalLeads || totalLeads < 1 || totalLeads > 500) {
    return Response.json(
      { error: "totalLeads must be between 1 and 500" },
      { status: 400 }
    );
  }

  if (
    !filters?.companyDomains?.length ||
    !filters?.jobTitles?.length ||
    !filters?.locations?.length
  ) {
    return Response.json(
      { error: "filters.companyDomains, jobTitles, and locations are required" },
      { status: 400 }
    );
  }

  const batchCount = Math.ceil(totalLeads / BATCH_SIZE);

  const buildQueryString = (batchSize: number): string => {
    const parts: string[] = [];
    for (const domain of filters.companyDomains) {
      parts.push(`q_organization_domains_list[]=${encodeURIComponent(domain)}`);
    }
    for (const title of filters.jobTitles) {
      parts.push(`person_titles[]=${encodeURIComponent(title)}`);
    }
    for (const city of filters.cities ?? []) {
      parts.push(`person_cities[]=${encodeURIComponent(city)}`);
    }
    for (const location of filters.locations) {
      parts.push(`person_locations[]=${encodeURIComponent(location)}`);
    }
    parts.push(`per_page=${batchSize}`);
    return parts.join("&");
  };

  const fireWebhooks = async () => {
    const batches = Array.from({ length: batchCount }, (_, i) => {
      const isLast = i === batchCount - 1;
      const batchSize = isLast ? totalLeads - i * BATCH_SIZE : BATCH_SIZE;
      return fetch(process.env.N8N_WEBHOOK_URL!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.N8N_WEBHOOK_SECRET ?? "",
        },
        body: JSON.stringify({
          queryString: buildQueryString(batchSize),
          batchIndex: i,
          totalBatches: batchCount,
        }),
      }).catch(console.error);
    });
    await Promise.all(batches);
  };

  waitUntil(fireWebhooks());

  return Response.json({
    status: "ok",
    totalRequested: totalLeads,
    batchCount,
    batchSize: BATCH_SIZE,
    message: `${batchCount} search${batchCount > 1 ? "es" : ""} triggered (${totalLeads} total leads). Results will appear in Airtable shortly.`,
  });
}
