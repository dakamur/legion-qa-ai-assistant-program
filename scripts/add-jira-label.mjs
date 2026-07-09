import 'dotenv/config';

const auth = Buffer.from(
  `${process.env.ATLASSIAN_EMAIL}:${process.env.ATLASSIAN_API_TOKEN}`,
).toString('base64');
const base = process.env.ATLASSIAN_BASE_URL.replace(/\/$/, '');

async function addLabel(issueKey, label) {
  const res = await fetch(`${base}/rest/api/3/issue/${issueKey}`, {
    method: 'PUT',
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ update: { labels: [{ add: label }] } }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${issueKey} label failed ${res.status}: ${body}`);
  }
  console.log(`Added label ${label} to ${issueKey}`);
}

const keys = process.argv.slice(2);
if (keys.length === 0) {
  console.error('Usage: node scripts/add-jira-label.mjs DS-2 DS-5');
  process.exit(1);
}

for (const key of keys) {
  await addLabel(key, 'tests-generated');
}
