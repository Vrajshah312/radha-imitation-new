// Minimal WordPress GraphQL (WPGraphQL) client. Point WORDPRESS_GRAPHQL_URL at
// your site's /graphql endpoint (e.g. https://your-store.com/graphql).
export function isWordPressConfigured() {
  return Boolean(process.env.WORDPRESS_GRAPHQL_URL);
}

export async function wpQuery(query, variables = {}) {
  const endpoint = process.env.WORDPRESS_GRAPHQL_URL;
  if (!endpoint) {
    const error = new Error("WORDPRESS_GRAPHQL_URL is not set");
    error.code = "WP_NOT_CONFIGURED";
    throw error;
  }

  const headers = { "Content-Type": "application/json" };
  if (process.env.WORDPRESS_AUTH_TOKEN) {
    headers.Authorization = `Bearer ${process.env.WORDPRESS_AUTH_TOKEN}`;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`WordPress GraphQL responded with ${response.status}`);
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((e) => e.message).join("; "));
  }
  return payload.data;
}
