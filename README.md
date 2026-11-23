# Shree Dev — agency site (Phase 0)

Static site. No build step, no npm, no external requests. Open `index.html`
or serve the folder.

```
agency-site/
  index.html        home
  services.html     scope, three bands, maintenance, FAQ
  demos.html        three demo cards (demos not built yet — Phase 2)
  start.html        intake form (save-as-you-type)
  legal.html        terms, privacy, refunds, agreement template
  assets/style.css  all styling
  assets/app.js     contact hydration, scroll reveal, form logic
  assets/config.js  THE ONLY FILE YOU EDIT TO GO LIVE
```

## One file to edit before launch

`assets/config.js`:

| Key | Meaning | Current |
|---|---|---|
| `email` | public contact email | **shreedev.jaipur@yahoo.com** |
| `phone` | public phone (display only) | **empty** |
| `whatsapp` | digits only | **empty** |
| `formEndpoint` | where intake posts | **empty** |
| `formApiKey` | public/RLS-protected key | **empty** |
| `city`, `cityRegion` | copy tokens | Rajasthan / India (locked 19 Nov 2026: All over Rajasthan) |

While `formEndpoint` is empty the form **saves to localStorage only** and shows
a yellow DEVELOPMENT banner. It never pretends to have sent anything. That is
deliberate — a form that silently drops enquiries is worse than no form.

## Deploy (free, when you have the account)

**Option A — GitHub Pages**
1. Create repo `shreedev-site`, push these files at the root.
2. Settings → Pages → Source: `main` / `/ (root)` → Save.
3. Live at `https://<user>.github.io/shreedev-site/`.
   Note: relative asset paths work, but page links are `index.html` style, so
   they work under a subpath too.

**Option B — Cloudflare Pages / Vercel** — connect the repo, no build command,
output directory `/`. Live at `*.pages.dev` / `*.vercel.app`.

**Custom domain later (b=no decision, 2026-11-19):** buy the domain, add it in
the host dashboard, add the DNS records the host prints. Nothing in this site
needs to change.

## Not done yet (blocked or next phase)

- [ ] Public URL — needs a GitHub/Cloudflare account (owner).
- [ ] Contact email + phone in `config.js` — owner decision.
- [ ] Form endpoint (Supabase table `intake_submissions`) — needs a free
      Supabase project. Until then the form is local-only.
- [ ] Three demo storefronts — Phase 2, with an image licence manifest.
- [ ] Spam protection on the form (honeypot + rate limit) — before going live.
- [ ] Reviewed legal documents — `d=self`, so drafts now, review before the
      first signed client.

## Verify locally

```powershell
cd agency-site
python -m http.server 8080
# then open http://localhost:8080/
```

Checked in G0: all five pages 200, every internal link resolves, zero external
network requests, no secrets in the repo.
