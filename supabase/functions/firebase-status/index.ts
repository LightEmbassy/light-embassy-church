// Reports whether the backend half of Firebase (FCM) is correctly configured.
// Never returns secret material — only booleans, the project id and a masked
// service-account email.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function b64url(input: ArrayBuffer | string) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function tokenExchange(sa: { client_email: string; private_key: string }) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const pem = sa.private_key.replace(/\\n/g, "\n")
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "pkcs8",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${header}.${claim}`));
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claim}.${b64url(sig)}`,
    }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json?.error_description || json?.error || `HTTP ${res.status}`);
  }
  return true;
}

function maskEmail(email?: string) {
  if (!email) return null;
  const [name, domain] = email.split("@");
  if (!domain) return "•••";
  return `${name.slice(0, 3)}•••@${domain}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const result: Record<string, unknown> = {
    secretPresent: false,
    secretValid: false,
    credentialsAccepted: false,
    projectId: null,
    serviceAccountEmail: null,
    error: null as string | null,
    checkedAt: new Date().toISOString(),
  };

  try {
    const raw = Deno.env.get("FCM_SERVICE_ACCOUNT_JSON");
    if (!raw) {
      result.error = "FCM_SERVICE_ACCOUNT_JSON is not configured";
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    result.secretPresent = true;

    let sa: { project_id?: string; client_email?: string; private_key?: string };
    try {
      sa = JSON.parse(raw);
    } catch {
      result.error = "Service account JSON could not be parsed";
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!sa.project_id || !sa.client_email || !sa.private_key) {
      result.error = "Service account JSON is missing project_id, client_email or private_key";
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    result.secretValid = true;
    result.projectId = sa.project_id;
    result.serviceAccountEmail = maskEmail(sa.client_email);

    await tokenExchange(sa as { client_email: string; private_key: string });
    result.credentialsAccepted = true;
  } catch (e) {
    result.error = String(e instanceof Error ? e.message : e);
  }

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
