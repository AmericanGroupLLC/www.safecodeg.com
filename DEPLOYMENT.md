# Deployment Guide — safecodeg.com on HostGator

This guide walks you through connecting your GitHub repository to HostGator so every push to `main` automatically builds and deploys the website to `safecodeg.com`.

---

## How It Works

```
You push code to GitHub (main branch)
        ↓
GitHub Actions runs automatically
        ↓
Installs dependencies + builds React app
        ↓
Uploads built files to HostGator via FTP
        ↓
safecodeg.com is live with the latest version ✅
```

---

## Step 1 — Get Your HostGator FTP Credentials

1. Log in to **HostGator cPanel** → [https://safecodeg.com:2083](https://safecodeg.com:2083)
2. Scroll to **Files** section → click **FTP Accounts**
3. Either use the **main FTP account** (same as cPanel login) or create a new one:
   - **Log In:** e.g. `deploy@safecodeg.com`
   - **Directory:** `/public_html`
   - **Password:** Create a strong password
4. Note down these three values:
   - **FTP Server:** `ftp.safecodeg.com` (or your server IP from HostGator welcome email)
   - **FTP Username:** e.g. `deploy@safecodeg.com`
   - **FTP Password:** the password you set

---

## Step 2 — Add GitHub Secrets

GitHub Secrets store your credentials securely — they are never visible in logs.

1. Go to your GitHub repo: [https://github.com/AmericanGroupLLC/www.safecodeg.com](https://github.com/AmericanGroupLLC/www.safecodeg.com)
2. Click **Settings** (top menu)
3. Left sidebar → **Secrets and variables** → **Actions**
4. Click **New repository secret** and add these **3 secrets** one by one:

| Secret Name    | Value                              | Example                    |
|----------------|------------------------------------|----------------------------|
| `FTP_SERVER`   | Your HostGator FTP hostname        | `ftp.safecodeg.com`        |
| `FTP_USERNAME` | Your FTP account username          | `deploy@safecodeg.com`     |
| `FTP_PASSWORD` | Your FTP account password          | `YourStrongPassword123!`   |

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

## Troubleshooting

### "FTP connection refused" error
- Double-check `FTP_SERVER` — try your server IP instead of `ftp.safecodeg.com`
- In HostGator cPanel → **FTP Accounts** → check the FTP hostname shown there

### "Authentication failed" error
- Verify `FTP_USERNAME` includes the full email format: `user@safecodeg.com`
- Reset the FTP password in cPanel and update the GitHub secret

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
