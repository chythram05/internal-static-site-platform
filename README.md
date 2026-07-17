# Internal Sites Platform

Give your company a simple place to deploy internal static sites.

Employees go to:

```
https://internal-company.com/deploy
```

They upload a folder or ZIP and get a URL like:

```
https://my-site.internal-company.com
```

Every site requires company login via Cloudflare Access.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/chythram05/internal-static-site-platform)

<!-- dash-content-start -->

## Features

- **Drag & drop deploy** -- Upload a folder or ZIP file from the browser and get a live URL instantly
- **Works on workers.dev** -- Test immediately after deploy. Path-based routing works out of the box on `*.workers.dev`
- **Protected by default** -- Once configured, every site sits behind Cloudflare Access. Employees must sign in with your company identity provider
- **Subdomain routing** -- In production, each site gets its own subdomain: `site-name.internal-company.com`
- **Deployment history** -- Tracks who deployed what and when, stored in D1
- **Admin dashboard** -- View all sites, deployments, and dispatch namespace scripts at `/admin`
- **Re-deploy in place** -- Upload to the same slug to update an existing site. Only the owner can overwrite
- **No build step** -- Static files only. Upload HTML/CSS/JS/images and they are live immediately

## How It Works

This template uses three Cloudflare products together:

1. **Workers for Platforms** -- Each deployed site becomes an isolated Worker in a dispatch namespace. The platform Worker routes requests to the correct site Worker
2. **D1** -- Stores site metadata (name, slug, owner, timestamps) and deployment history
3. **Cloudflare Access** -- Enforces company login on every request. The platform reads the `Cf-Access-Authenticated-User-Email` header to identify who is deploying

## Architecture

```
Request
  |
  v
Cloudflare Access (company login required)
  |
  v
Platform Worker (this template)
  |
  ├── /deploy           -> Drag & drop deploy UI
  ├── /admin            -> Admin dashboard
  ├── /api/sites/deploy -> Deploy API (uploads files to dispatch namespace)
  |
  └── *.internal-company.com
        |
        v
      Dispatch Namespace (Workers for Platforms)
        ├── docs.internal-company.com   -> docs Worker
        ├── handbook.internal-company.com -> handbook Worker
        └── ...
```

## Bindings Used

- **dispatcher** (Workers for Platforms) -- Routes requests to deployed site Workers
- **DB** (D1) -- Stores site metadata and deployment history

<!-- dash-content-end -->

---

## Quick Start

After clicking **Deploy to Cloudflare**, the platform works immediately on workers.dev:

1. Open `https://your-worker.your-subdomain.workers.dev/deploy`
2. Upload a folder or ZIP containing an `index.html`
3. Click **Deploy site**
4. The generated URL uses path-based routing: `https://your-worker.workers.dev/sites/slug/`

This is testing mode. For production, follow the full setup below to get subdomain routing and Access protection.

---

## Set Up

### 1. Deploy this app

Click the **Deploy to Cloudflare** button above.

During setup you will be prompted for:

| Secret / Variable | Description |
|---|---|
| `DISPATCH_NAMESPACE_API_TOKEN` | API token with **Workers Scripts Edit** permission. [Create a Custom Token](https://dash.cloudflare.com/profile/api-tokens) with `Account > Workers Scripts > Edit` scoped to your account. |
| `SITE_DOMAIN` | Your company's internal domain, e.g. `internal-company.com` |

The deploy flow will automatically provision the D1 database and dispatch namespace.

### 2. Create your API token

Before deploying sites, you need a Cloudflare API token that lets the platform deploy Workers into the dispatch namespace.

1. Go to [https://dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Select **Create Custom Token**
4. Set permissions: **Account** > **Workers Scripts** > **Edit**
5. Scope it to your account only
6. Click **Continue to summary** > **Create Token**
7. Copy the token and set it as a secret:

```bash
npx wrangler secret put DISPATCH_NAMESPACE_API_TOKEN
```

### 3. Attach your platform domain

Update `SITE_DOMAIN` in `wrangler.jsonc` to your real domain. Once `SITE_DOMAIN` is set to something other than the default `internal-company.com`, the platform switches to subdomain routing automatically.

**a. Update `SITE_DOMAIN` and add routes** in `wrangler.jsonc`:

```jsonc
{
  "workers_dev": false,
  "vars": {
    "SITE_DOMAIN": "yourcompany.com"
  },
  "routes": [
    { "pattern": "yourcompany.com/deploy*", "zone_name": "yourcompany.com" },
    { "pattern": "*.yourcompany.com/*", "zone_name": "yourcompany.com" }
  ]
}
```

**b. Add DNS records** in your Cloudflare DNS settings:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | `192.0.2.1` | Proxied |
| A | `*` | `192.0.2.1` | Proxied |

**c. Redeploy:**

```bash
npx wrangler deploy
```

### 4. Require company login

Create one Cloudflare Access policy for the deployed Worker:

1. Go to **Zero Trust** > **Access** > **Applications**
2. Click **Add an application** > **Self-hosted**
3. Set the application domain to your platform domain (e.g. `yourcompany.com` and `*.yourcompany.com`)
4. Under **Policies**, create an Allow policy for your company users
5. Select your company identity provider (Google Workspace, Okta, Azure AD, etc.)
6. Save

This makes users sign in before they can use the deploy page or view any deployed site.

Now employees can deploy from `https://yourcompany.com/deploy` and sites will be available at `https://site-name.yourcompany.com`.

---

## Routing Modes

The platform auto-detects its routing mode based on the request:

| Mode | When | Site URLs | Auth |
|------|------|-----------|------|
| **Testing** | workers.dev, localhost, or `SITE_DOMAIN` is default placeholder | `/sites/slug/` (path-based) | Not required |
| **Production** | `SITE_DOMAIN` set to real domain + custom domain configured | `slug.yourcompany.com` (subdomain) | Cloudflare Access required |

No manual flags are needed. The routing mode is derived from the request hostname and `SITE_DOMAIN` value.

---

## Use

1. Open `/deploy`
2. Enter a site name
3. Upload a folder or ZIP
4. Click **Deploy site**
5. Open or copy the generated URL

The uploaded folder or ZIP must include an `index.html` at the root.

---

## Local Development

```bash
# Install dependencies
npm install

# Start local dev server (requires remote bindings)
npm run dev
```

Local dev uses path-based routing automatically (localhost is detected as testing mode):

```
http://localhost:8787/sites/site-name/
```

---

## Manual Deploy (without Deploy to Cloudflare button)

```bash
npm install

# Create the dispatch namespace
npx wrangler dispatch-namespace create internal-sites

# Create the D1 database
npx wrangler d1 create internal-sites-platform
# Update the database_id in wrangler.jsonc with the returned ID

# Set your API token as a secret
npx wrangler secret put DISPATCH_NAMESPACE_API_TOKEN

# Deploy
npx wrangler deploy
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Company sign-in is required" | This appears on a custom domain when Access is not configured. See step 4 above. On workers.dev this should not appear. |
| "Could not create asset upload session" | Check that `DISPATCH_NAMESPACE_API_TOKEN` is set and has Workers Scripts Edit permission |
| "Dispatch namespace not found" | Run `npx wrangler dispatch-namespace create internal-sites` |
| 404 on deployed sites | Ensure uploaded files include `index.html` at the root |
| "Site slug is already owned by another user" | Each slug is owned by the first person who deploys it |
| Database errors | Visit `/admin` to check status. Tables auto-create on first request |

**View logs:**

```bash
npx wrangler tail
```

---

## License

Apache-2.0
