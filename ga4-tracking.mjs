/**
 * GA4 Data API reporting & Measurement Protocol event sender.
 * Pulls credentials from Doppler (integrity-studio/dev).
 *
 * Usage:
 *   doppler run --project integrity-studio --config dev -- node ga4-tracking.mjs [command] [options]
 *
 * Commands:
 *   overview     — 30-day summary (default)
 *   pages        — Top pages by views
 *   sources      — Traffic sources breakdown
 *   devices      — Device/browser breakdown
 *   brands       — Content group (brand) performance
 *   engagement   — Scroll depth + time-on-page custom events
 *   realtime     — Active users right now
 *   send-event   — Send a Measurement Protocol event
 *
 * Options:
 *   --days N     — Date range in days (default: 30)
 *   --json       — Output as JSON instead of table
 *   --limit N    — Max rows returned (default: 20)
 *
 * Required env vars (from Doppler):
 *   GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GA4_PROPERTY_ID
 *
 * For send-event only:
 *   GOOGLE_ANALYTICS_MEASUREMENT_ID, GOOGLE_ANALYTICS_API_SECRET
 */

import { BetaAnalyticsDataClient } from "@google-analytics/data";

// --- CLI parsing ---

const args = process.argv.slice(2);
const command = args.find((a) => !a.startsWith("--")) || "overview";
const days = parseInt(flagValue("--days") || "30", 10);
const jsonOutput = args.includes("--json");
const limit = parseInt(flagValue("--limit") || "20", 10);

function flagValue(name) {
  const idx = args.indexOf(name);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : null;
}

// --- Environment ---

const REPORT_ENV = ["GOOGLE_CLIENT_EMAIL", "GOOGLE_PRIVATE_KEY", "GA4_PROPERTY_ID"];
const EVENT_ENV = ["GOOGLE_ANALYTICS_MEASUREMENT_ID", "GOOGLE_ANALYTICS_API_SECRET"];

function requireEnv(keys) {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`Missing env vars: ${missing.join(", ")}`);
    console.error("Run with: doppler run --project integrity-studio --config dev -- node ga4-tracking.mjs");
    process.exit(1);
  }
}

let _client;

function getClient() {
  if (!_client) {
    _client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
    });
  }
  return _client;
}

function propertyPath() {
  return getClient().propertyPath(process.env.GA4_PROPERTY_ID);
}

// --- Report runners ---

async function runGenericReport({ dimensions, metrics, orderBys, dimensionFilter }) {
  const client = getClient();
  const request = {
    property: propertyPath(),
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
    dimensions: dimensions.map((name) => ({ name })),
    metrics: metrics.map((name) => ({ name })),
    limit,
  };
  if (orderBys) request.orderBys = orderBys;
  if (dimensionFilter) request.dimensionFilter = dimensionFilter;

  const [response] = await client.runReport(request);
  return response;
}

async function overview() {
  const response = await runGenericReport({
    dimensions: ["date"],
    metrics: ["activeUsers", "newUsers", "sessions", "screenPageViews", "averageSessionDuration", "bounceRate"],
    orderBys: [{ dimension: { dimensionName: "date", orderType: "ALPHANUMERIC" }, desc: false }],
  });

  if (jsonOutput) return printJson(response);

  console.log(`\n=== Site Overview (Last ${days} Days) ===\n`);
  console.log("Date       | Users | New | Sessions | Views | Avg Duration | Bounce");
  console.log("-".repeat(78));

  for (const row of response.rows ?? []) {
    const [date] = dimValues(row);
    const [users, newUsers, sessions, views, duration, bounce] = metricValues(row);
    const durationFormatted = formatDuration(parseFloat(duration));
    const bounceFormatted = (parseFloat(bounce) * 100).toFixed(1) + "%";
    console.log(
      `${date} | ${pad(users, 5)} | ${pad(newUsers, 3)} | ${pad(sessions, 8)} | ${pad(views, 5)} | ${pad(durationFormatted, 12)} | ${bounceFormatted}`
    );
  }

  // Totals
  if (response.totals?.length) {
    const totals = response.totals[0].metricValues.map((m) => m.value);
    console.log("-".repeat(78));
    console.log(
      `TOTAL      | ${pad(totals[0], 5)} | ${pad(totals[1], 3)} | ${pad(totals[2], 8)} | ${pad(totals[3], 5)} | ${pad(formatDuration(parseFloat(totals[4])), 12)} | ${(parseFloat(totals[5]) * 100).toFixed(1)}%`
    );
  }
}

async function topPages() {
  const response = await runGenericReport({
    dimensions: ["pageTitle", "pagePath"],
    metrics: ["screenPageViews", "activeUsers", "averageSessionDuration"],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
  });

  if (jsonOutput) return printJson(response);

  console.log(`\n=== Top Pages (Last ${days} Days) ===\n`);
  console.log("Views | Users | Avg Time | Page");
  console.log("-".repeat(80));

  for (const row of response.rows ?? []) {
    const [title, path] = dimValues(row);
    const [views, users, duration] = metricValues(row);
    const displayTitle = title.length > 40 ? title.substring(0, 37) + "..." : title;
    console.log(`${pad(views, 5)} | ${pad(users, 5)} | ${pad(formatDuration(parseFloat(duration)), 8)} | ${displayTitle} (${path})`);
  }
}

async function trafficSources() {
  const response = await runGenericReport({
    dimensions: ["sessionSource", "sessionMedium"],
    metrics: ["sessions", "activeUsers", "screenPageViews", "bounceRate"],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
  });

  if (jsonOutput) return printJson(response);

  console.log(`\n=== Traffic Sources (Last ${days} Days) ===\n`);
  console.log("Sessions | Users | Views | Bounce | Source / Medium");
  console.log("-".repeat(70));

  for (const row of response.rows ?? []) {
    const [source, medium] = dimValues(row);
    const [sessions, users, views, bounce] = metricValues(row);
    console.log(
      `${pad(sessions, 8)} | ${pad(users, 5)} | ${pad(views, 5)} | ${pad((parseFloat(bounce) * 100).toFixed(1) + "%", 6)} | ${source} / ${medium}`
    );
  }
}

async function devices() {
  const response = await runGenericReport({
    dimensions: ["deviceCategory", "browser"],
    metrics: ["activeUsers", "sessions", "screenPageViews"],
    orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
  });

  if (jsonOutput) return printJson(response);

  console.log(`\n=== Devices & Browsers (Last ${days} Days) ===\n`);
  console.log("Users | Sessions | Views | Device / Browser");
  console.log("-".repeat(60));

  for (const row of response.rows ?? []) {
    const [device, browser] = dimValues(row);
    const [users, sessions, views] = metricValues(row);
    console.log(`${pad(users, 5)} | ${pad(sessions, 8)} | ${pad(views, 5)} | ${device} / ${browser}`);
  }
}

async function brands() {
  const response = await runGenericReport({
    dimensions: ["contentGroup"],
    metrics: ["activeUsers", "sessions", "screenPageViews", "averageSessionDuration"],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
  });

  if (jsonOutput) return printJson(response);

  console.log(`\n=== Brand Performance (Last ${days} Days) ===\n`);
  console.log("Views | Users | Sessions | Avg Time | Brand");
  console.log("-".repeat(60));

  for (const row of response.rows ?? []) {
    const [group] = dimValues(row);
    const [users, sessions, views, duration] = metricValues(row);
    console.log(`${pad(views, 5)} | ${pad(users, 5)} | ${pad(sessions, 8)} | ${pad(formatDuration(parseFloat(duration)), 8)} | ${group}`);
  }
}

async function engagement() {
  const client = getClient();
  const dateRanges = [{ startDate: `${days}daysAgo`, endDate: "today" }];

  // Batch both engagement reports in a single API call
  const [batchResponse] = await client.batchRunReports({
    property: propertyPath(),
    requests: [
      {
        dateRanges,
        dimensions: [{ name: "customEvent:percent_scrolled" }, { name: "customEvent:brand" }],
        metrics: [{ name: "eventCount" }, { name: "activeUsers" }],
        dimensionFilter: {
          filter: { fieldName: "eventName", stringFilter: { value: "scroll_depth" } },
        },
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        limit,
      },
      {
        dateRanges,
        dimensions: [{ name: "customEvent:seconds" }, { name: "customEvent:brand" }],
        metrics: [{ name: "eventCount" }, { name: "activeUsers" }],
        dimensionFilter: {
          filter: { fieldName: "eventName", stringFilter: { value: "time_on_page" } },
        },
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        limit,
      },
    ],
  });

  const [scrollResponse, timeResponse] = batchResponse.reports;

  if (jsonOutput) return printJson({ scroll_depth: scrollResponse, time_on_page: timeResponse });

  console.log(`\n=== Engagement: Scroll Depth (Last ${days} Days) ===\n`);
  console.log("Events | Users | Scroll % | Brand");
  console.log("-".repeat(50));
  for (const row of scrollResponse.rows ?? []) {
    const [pct, brand] = dimValues(row);
    const [events, users] = metricValues(row);
    console.log(`${pad(events, 6)} | ${pad(users, 5)} | ${pad(pct + "%", 8)} | ${brand}`);
  }

  console.log(`\n=== Engagement: Time on Page (Last ${days} Days) ===\n`);
  console.log("Events | Users | Seconds | Brand");
  console.log("-".repeat(50));
  for (const row of timeResponse.rows ?? []) {
    const [seconds, brand] = dimValues(row);
    const [events, users] = metricValues(row);
    console.log(`${pad(events, 6)} | ${pad(users, 5)} | ${pad(seconds + "s", 7)} | ${brand}`);
  }
}

async function realtime() {
  requireEnv(REPORT_ENV);
  const client = getClient();

  const [response] = await client.runRealtimeReport({
    property: propertyPath(),
    dimensions: [{ name: "unifiedScreenName" }],
    metrics: [{ name: "activeUsers" }],
    limit,
  });

  if (jsonOutput) return printJson(response);

  console.log("\n=== Realtime Active Users ===\n");
  if (!response.rows?.length) {
    console.log("No active users right now.");
    return;
  }
  console.log("Active | Page");
  console.log("-".repeat(50));
  for (const row of response.rows) {
    const [page] = dimValues(row);
    const [users] = metricValues(row);
    console.log(`${pad(users, 6)} | ${page}`);
  }
}

async function sendEvent() {
  requireEnv(EVENT_ENV);

  const measurementId = process.env.GOOGLE_ANALYTICS_MEASUREMENT_ID;
  const apiSecret = process.env.GOOGLE_ANALYTICS_API_SECRET;
  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;

  const eventName = flagValue("--event") || "page_view";
  const pageTitle = flagValue("--title") || "Reports Hub";
  const pageLocation = flagValue("--url") || "https://integritystudio.io/";

  const payload = {
    client_id: `server.${Date.now()}`,
    events: [
      {
        name: eventName,
        params: {
          page_title: pageTitle,
          page_location: pageLocation,
          engagement_time_msec: "1",
        },
      },
    ],
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Measurement Protocol error: ${res.status} ${res.statusText}`);
  }

  const result = { event: eventName, page_title: pageTitle, page_location: pageLocation, status: "sent" };
  if (jsonOutput) return printJson(result);
  console.log(`Event "${eventName}" sent — ${pageTitle} (${pageLocation})`);
}

// --- Formatting helpers ---

function dimValues(row) {
  return row.dimensionValues.map((d) => d.value);
}

function metricValues(row) {
  return row.metricValues.map((m) => m.value);
}

function pad(val, width) {
  return String(val).padStart(width);
}

function formatDuration(seconds) {
  if (isNaN(seconds)) return "0s";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function printJson(data) {
  console.log(JSON.stringify(data, null, 2));
}

// --- Router ---

const commands = {
  overview,
  pages: topPages,
  sources: trafficSources,
  devices,
  brands,
  engagement,
  realtime,
  "send-event": sendEvent,
};

async function main() {
  if (command === "send-event") {
    requireEnv(EVENT_ENV);
  } else {
    requireEnv(REPORT_ENV);
  }

  const handler = commands[command];
  if (!handler) {
    console.error(`Unknown command: ${command}`);
    console.error(`Available: ${Object.keys(commands).join(", ")}`);
    process.exit(1);
  }

  await handler();
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
