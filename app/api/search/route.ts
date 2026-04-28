import { waitUntil } from "@vercel/functions";

const MAX_LEADS_PER_WEBHOOK = 25;

interface CompanyQuery {
  domain: string;
  perPage: number;
}

interface Filters {
  jobTitles: string[];
  locations: string[];
  cities: string[];
}

interface Webhook {
  domain: string;
  perPage: number;
}

export async function POST(request: Request) {
  const { companies, filters }: { companies: CompanyQuery[]; filters: Filters } =
    await request.json();

  if (!companies?.length) {
    return Response.json({ error: "companies array is required" }, { status: 400 });
  }
  if (!filters?.jobTitles?.length || !filters?.locations?.length) {
    return Response.json(
      { error: "filters.jobTitles and locations are required" },
      { status: 400 }
    );
  }
  for (const c of companies) {
    if (!c.domain || c.perPage < 1) {
      return Response.json(
        { error: `Invalid entry for ${c.domain}` },
        { status: 400 }
      );
    }
  }

  // One company per webhook. If perPage > 25, split into chunks of 25.
  // e.g. Mediclinic 60 → [25, 25, 10]
  const webhooks: Webhook[] = [];
  for (const company of companies) {
    let remaining = company.perPage;
    while (remaining > 0) {
      const chunk = Math.min(remaining, MAX_LEADS_PER_WEBHOOK);
      webhooks.push({ domain: company.domain, perPage: chunk });
      remaining -= chunk;
    }
  }

  const totalWebhooks = webhooks.length;
  const totalLeadsRequested = companies.reduce((sum, c) => sum + c.perPage, 0);

  const fireWebhooks = async () => {
    await Promise.all(
      webhooks.map((webhook, i) =>
        fetch(process.env.N8N_WEBHOOK_URL!, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.N8N_WEBHOOK_SECRET ?? "",
          },
          body: JSON.stringify({
            domain: webhook.domain,
            perPage: webhook.perPage,
            filters,
            batchIndex: i,
            totalBatches: totalWebhooks,
          }),
        }).catch(console.error)
      )
    );
  };

  waitUntil(fireWebhooks());

  return Response.json({
    status: "ok",
    totalLeadsRequested,
    totalWebhooks,
    message: `${totalWebhooks} search${totalWebhooks > 1 ? "es" : ""} triggered (${totalLeadsRequested} total leads). Results will appear in Airtable shortly.`,
  });
}
