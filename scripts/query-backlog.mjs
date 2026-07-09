import 'dotenv/config';

const missing = ['ATLASSIAN_EMAIL', 'ATLASSIAN_API_TOKEN', 'ATLASSIAN_BASE_URL'].filter(
  (key) => !process.env[key],
);
if (missing.length > 0) {
  console.error(`Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

const auth = Buffer.from(
  `${process.env.ATLASSIAN_EMAIL}:${process.env.ATLASSIAN_API_TOKEN}`,
).toString('base64');
const base = process.env.ATLASSIAN_BASE_URL.replace(/\/$/, '');
const headers = { Authorization: `Basic ${auth}`, Accept: 'application/json' };

const projectRes = await fetch(`${base}/rest/api/3/project/DS`, { headers });
if (!projectRes.ok) {
  const body = await projectRes.text();
  console.error(`Cannot access Jira project DS (${projectRes.status}): ${body}`);
  console.error('Grant Browse Projects and View Issues for the API token user.');
  process.exit(1);
}

const jql =
  'project = DS AND status = "In Progress" AND labels != tests-generated ORDER BY priority DESC, key ASC';
const url = `${base}/rest/api/3/search/jql?fields=summary,status,priority,labels&maxResults=10&jql=${encodeURIComponent(jql)}`;

const res = await fetch(url, { headers });
const data = await res.json();
if (!res.ok) {
  console.error(JSON.stringify(data, null, 2));
  process.exit(1);
}

const issues = (data.issues ?? []).map((i) => ({
  key: i.key,
  summary: i.fields.summary,
  priority: i.fields.priority?.name,
  labels: i.fields.labels,
}));

const total = data.total ?? issues.length;
console.log(JSON.stringify({ total, issues }, null, 2));

if (total === 0) {
  console.log('Preflight OK: Jira access works, but no eligible backlog tickets right now.');
}
