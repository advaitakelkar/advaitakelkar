# Deploy Guide — advaitakelkar.com

Stack: Astro 5 · Keystatic CMS · GitHub · Firebase Hosting · Porkbun DNS

---

## 1. Local Development

```bash
cd advaitakelkar-v2
npm install
npm run dev        # → http://localhost:4321
                   # Keystatic admin → http://localhost:4321/keystatic
```

Open `designer.html` in a browser to preview at 375 / 768 / 1024 / 1440 breakpoints.

---

## 2. GitHub Setup

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/advaitakelkar-v2.git
git push -u origin main
```

---

## 3. Firebase Setup

### 3a. Create Firebase project
1. Go to https://console.firebase.google.com
2. Create project → name it `advaitakelkar-site`
3. Enable **Hosting** (left sidebar → Build → Hosting)

### 3b. Connect Firebase to GitHub Actions
1. In Firebase Console → Project Settings → Service accounts
2. Generate new private key → downloads `serviceAccount.json`
3. In GitHub repo → Settings → Secrets and variables → Actions → New secret:
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: paste the entire contents of `serviceAccount.json`

### 3c. Initialize Firebase locally (optional, one-time)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # choose existing project: advaitakelkar-site
                        # public dir: dist
                        # single-page app: No
                        # GitHub Actions: No (already set up)
```

---

## 4. Deploy Workflow

Every `git push` to `main` automatically:
1. Runs `npm run build` (Astro SSG → `dist/`)
2. Deploys `dist/` to Firebase Hosting

Manual deploy:
```bash
npm run build
firebase deploy --only hosting
```

---

## 5. Custom Domain — Porkbun → Firebase

### 5a. Add domain in Firebase
1. Firebase Console → Hosting → Add custom domain
2. Enter `advaitakelkar.com`
3. Firebase gives you two A records and a TXT verification record

### 5b. Set DNS in Porkbun
1. Log in to https://porkbun.com → Domains → advaitakelkar.com → DNS
2. Delete any existing A records for `@`
3. Add the records Firebase provided:

| Type | Host | Value              |
|------|------|--------------------|
| A    | @    | 151.101.1.195      |
| A    | @    | 151.101.65.195     |
| TXT  | @    | `firebase-site-verification=...` |
| CNAME| www  | advaitakelkar.com.  |

*(exact IPs and verification value come from Firebase Console — use those, not the above)*

4. Wait 15–60 minutes for DNS propagation
5. Firebase auto-provisions SSL certificate

---

## 6. Content Editing (Keystatic)

Run locally:
```bash
npm run dev
```
Go to `http://localhost:4321/keystatic`

- Edit any project, tag, or category
- Keystatic saves changes as YAML files in `src/content/`
- Commit and push → site rebuilds automatically

---

## 7. Adding Images

1. Place images in `public/images/projects/`
2. Update `coverImage` / `multiImage` in the project's YAML file to `/images/projects/filename.jpg`
3. Or use Keystatic admin → it handles the upload path automatically

---

## 8. Project Structure

```
advaitakelkar-v2/
├── src/
│   ├── content/
│   │   ├── projects/   ← 52 YAML files (one per project)
│   │   ├── tags/       ← 11 YAML files
│   │   └── categories/ ← 6 YAML files
│   ├── components/
│   │   ├── SideNav.astro
│   │   └── Breadcrumb.astro
│   ├── layouts/
│   │   ├── Base.astro
│   │   └── PageLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── projects/[slug].astro
│   │   ├── type/[slug].astro
│   │   ├── tags/[slug].astro
│   │   └── 404.astro
│   └── styles/
│       └── tokens.css   ← All 9 color schemes + design tokens
├── public/
│   ├── ak-logo.svg
│   └── images/projects/
├── designer.html         ← Responsive preview tool (open in browser)
├── keystatic.config.ts
├── astro.config.mjs
├── firebase.json
└── .github/workflows/deploy.yml
```
