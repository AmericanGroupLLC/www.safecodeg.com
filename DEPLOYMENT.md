# Deployment Guide — safecodeg.com on HostGator

This guide walks you through connecting your GitHub repository to HostGator so every push to `main` automatically builds and deploys the website to `safecodeg.com`.

---

## ⚠️ Read before the next push to `main`

Three things are true about the **live** site right now that a green build
does not fix on its own. All three were measured directly against
`https://safecodeg.com`, not inferred, and none can be resolved by this
pipeline alone:

1. **The live site is not reproducible from this repo.** The live page's
   entry script, the tracked root `index.html`'s reference, and a fresh
   local build each name a *different* JS bundle hash. Concretely, checked
   this session: live currently serves `assets/index-C6yZOK4E.js`; the
   tracked root `index.html` (a large, separately-committed static file)
   references `assets/index-rcb6U05a.js`. Since the deploy step below is
   `rsync --delete`, the next push replaces a build that nobody can currently
   account for. Treat the live site as **not a valid source of truth** for
   what this repo currently does — verify against a local production build
   (`pnpm run build && pnpm run start`) instead.
2. **Live loads a third-party script**, `https://manus-analytics.com/umami`,
   on a site with a published Privacy Policy. Confirmed this session
   (`curl https://safecodeg.com/` shows the tag). This pipeline's own build
   sets `VITE_ANALYTICS_ENDPOINT: ""` (`.github/workflows/deploy.yml`'s
   "Build production bundle" step), so this script is not something the
   current `main` branch's code requests — it is present only because of
   what the live site was previously deployed from. Decide whether
   analytics should be enabled before or after resolving item 1; this
   document does not make that call.
3. **`sophia-avatar_9b8b67b1.png`** (the AI chat widget's avatar) is
   referenced by `client/src/components/AIChatWidget.tsx`, returns HTTP 200
   on the live site today, and **does not exist** in either `client/public/`
   or a fresh `dist/public/` build. Because the deploy step is
   `rsync --delete`, the **next push removes this file from production** —
   the widget will request an image that 404s. Either supply the real asset
   under `client/public/` before the next push, or replace the reference
   with an asset that is actually tracked in this repo.

None of these block a deploy from succeeding — the workflow will report
green either way. They are listed here so a green run is never mistaken for
"safe to deploy."

---

## How It Works

```
You push code to GitHub (main branch)
        ↓
GitHub Actions runs automatically
        ↓
Installs dependencies + builds React app
        ↓
Uploads built files to HostGator over SSH (rsync)
        ↓
safecodeg.com is live with the latest version ✅
```

> **Note on this section's history:** earlier versions of this guide (and its
> step titles below) described an FTP-based deploy. The workflow that
> actually runs today, `.github/workflows/deploy.yml`, transfers files over
> **SSH using `rsync`**, not FTP — verified by reading the workflow file,
> which authenticates with `secrets.SSH_HOST`, `secrets.SSH_USERNAME` and
> `secrets.SSH_PRIVATE_KEY` and has no FTP step at all. The steps below now
> describe the SSH path the workflow actually takes.

---

## Step 1 — Get Your HostGator SSH Access

1. Log in to **HostGator cPanel** → [https://safecodeg.com:2083](https://safecodeg.com:2083)
2. Find **SSH Access** (Security section) and confirm SSH is enabled for this
   account — on shared hosting this sometimes needs enabling by a support
   request.
3. Generate an SSH key pair **locally** (not on the server), e.g.:
   ```
   ssh-keygen -t ed25519 -C "deploy@safecodeg.com" -f deploy_key
   ```
   This produces `deploy_key` (private) and `deploy_key.pub` (public).
4. In cPanel → **SSH Access** → **Manage SSH Keys** → **Import Key**, paste
   the contents of `deploy_key.pub`, then **Authorize** it.
5. Note down these values:
   - **SSH Host:** your HostGator server hostname or IP (shown in cPanel's
     SSH Access page, or your HostGator welcome email)
   - **SSH Username:** your cPanel username
   - **SSH Private Key:** the full contents of `deploy_key` (the file with
     no `.pub` extension) — never the public key

---

## Step 2 — Add GitHub Secrets

GitHub Secrets store your credentials securely — they are never visible in logs.

1. Go to your GitHub repo: [https://github.com/AmericanGroupLLC/www.safecodeg.com](https://github.com/AmericanGroupLLC/www.safecodeg.com)
2. Click **Settings** (top menu)
3. Left sidebar → **Secrets and variables** → **Actions**
4. Click **New repository secret** and add these **5 secrets** one by one:

| Secret Name             | Value                              | Example                    |
|--------------------------|------------------------------------|----------------------------|
| `SSH_HOST`               | Your HostGator SSH hostname or IP  | `server.hostgator.com`     |
| `SSH_USERNAME`           | Your cPanel/SSH username           | `safecode`                 |
| `SSH_PRIVATE_KEY`        | The full private key file contents from Step 1 | `-----BEGIN OPENSSH PRIVATE KEY-----…` |
| `VITE_SUPABASE_URL`      | The dimensional stack's Supabase project URL (6D "shared stage") | `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | That project's **anon** key — never the service-role key | `eyJ...` |

**The two `VITE_SUPABASE_*` secrets are new, added for the 6D "shared stage"
collaboration feature** (`DIMENSIONS.md`). They are consumed by the **existing**
build step below — no new deploy target, no new host, no new workflow file.
Both are safe to leave unset: `.env.example` and the app code both treat an
absent Supabase URL/key as a normal, honest "unconfigured" state — the 6D
stage reports itself as such rather than breaking the build or the site. The
anon key is meant to be public once it ships in the browser bundle; its
safety rests entirely on the Row Level Security policies described below, not
on keeping the key secret.

---

## Step 3 — Trigger the First Deploy

Once secrets are added, the workflow runs automatically on every push to `main`.

To trigger it manually right now:
1. Go to your repo → **Actions** tab
2. Click **Build & Deploy to HostGator** workflow
3. Click **Run workflow** → **Run workflow** (green button)

Watch the live logs — the full build + deploy takes about **2–3 minutes**.

---

## Step 4 — Verify on HostGator

After the workflow completes:
1. Log in to HostGator cPanel → **File Manager**
2. Open `/public_html/`
3. You should see `index.html`, `assets/` folder, etc.
4. Visit [https://safecodeg.com](https://safecodeg.com) — your site is live! 🎉

---

## The dimensional stack (3D–7D) — deployment notes

The `/dimensions` feature (see `DIMENSIONS.md`) is almost entirely static —
it ships through the same `pnpm run build` + rsync pipeline as the rest of
the site. It adds exactly three things to the deploy story, and one thing it
deliberately does **not** add.

**1. Two build-time secrets** — already covered in Step 2 above
(`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). They are consumed inside the
**existing** "Build production bundle" step's `env:` block
(`.github/workflows/deploy.yml`) — no new job, no new step, no new host.

**2. Two SQL migrations that must be applied by hand.** They are **not**
run automatically by this workflow — there is no `supabase db push` step in
`.github/workflows/deploy.yml`, and this repo has no Supabase CLI wiring at
all today. Before the 6D "shared stage" can work against a real Supabase
project, both files under `supabase/migrations/` must be run, in order,
against that project (via the Supabase SQL editor, or the Supabase CLI
pointed at the project):

| File | What it does |
|---|---|
| `0001_dimensions_room_state.sql` | Creates `public.dimensions_room_state` (the digital-twin table), enables Row Level Security, and grants `anon` SELECT/INSERT/UPDATE — deliberately **not** DELETE — each backed by an explicit policy. |
| `0002_dimensions_room_state_single_room.sql` | Adds a `CHECK` constraint pinning `room_id = 'dimensions-demo'`, so an anon caller cannot create unlimited rooms and exhaust storage shared with the `contact_submissions` table on the same project. |

Both files carry their own rollback SQL in a trailing comment block. Until
they are applied, an unset or misconfigured `VITE_SUPABASE_*` pair simply
means the 6D stage reports "unconfigured" — it does not break the build or
the rest of the site.

**3. One `.htaccess` line, already committed.** Both `.htaccess` copies
(`client/public/.htaccess`, which reaches `dist/public/.htaccess` on build,
and the byte-identical repo-root `.htaccess`) now include:

```apache
AddType model/vnd.usdz+zip .usdz
```

This is required for Apple's AR Quick Look — without the correct MIME type,
iOS Safari will not open the `.usdz` file as an AR model. No other
`.htaccess`, MIME, or compression change was needed: the 5D physics engine
(`cannon-es`) has no `.wasm` payload, and no Content-Security-Policy exists
in this repo to update.

**What this feature deliberately does NOT add:** a Supabase Edge Function.
If the 5D AI capability is ever built as a hosted-LLM proxy (one of three
possible designs — see `DIMENSIONS.md`'s 5D section), that specific option
**would** add a `supabase functions deploy` step outside this rsync
pipeline, plus a server-side secret (an Anthropic API key) that must never
be `VITE_`-prefixed or otherwise reach the client bundle. **No such function
exists in this repo today** — this is flagged so the deploy story is
understood in advance, not discovered when that capability eventually ships.

---

## Troubleshooting

### "Connection refused" / `ssh-keyscan` fails
- Double-check `SSH_HOST` — try your server IP instead of a hostname
- Confirm SSH access is actually enabled for this account in cPanel → **SSH Access**

### "Permission denied (publickey)" error
- Confirm the **public** key (`deploy_key.pub`) was imported and authorized in
  cPanel → **SSH Access** → **Manage SSH Keys**
- Confirm the GitHub secret `SSH_PRIVATE_KEY` holds the matching **private**
  key's full contents, including the `-----BEGIN …-----` / `-----END …-----`
  lines
- Confirm `SSH_USERNAME` is the cPanel account username, not an email address

### Build fails
- Check the Actions log for the exact error
- Most common: missing environment variable — all `VITE_*` vars in the workflow have safe defaults

### Site shows old content after deploy
- HostGator may cache files — hard refresh with `Ctrl+Shift+R`
- Or clear cache in cPanel → **Caching** (if available)

---

## Future Deploys

From now on, every time you (or the AI assistant) pushes code to the `main` branch:

1. GitHub Actions automatically triggers
2. Builds the latest version
3. Uploads only **changed files** to HostGator (fast, ~30 seconds after build)
4. safecodeg.com updates live

No manual steps needed after initial setup. ✅

---

## File Structure After Build

```
public_html/          ← HostGator root
├── index.html        ← React SPA entry point
├── assets/
│   ├── index-[hash].js    ← Bundled JavaScript
│   └── index-[hash].css   ← Bundled CSS
└── robots.txt
```

> **Important:** HostGator must serve `index.html` for all routes (React Router).
> Add a `.htaccess` file in `public_html/` with the content below if pages like `/products` return 404:

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

This file is already included in the build output automatically.
