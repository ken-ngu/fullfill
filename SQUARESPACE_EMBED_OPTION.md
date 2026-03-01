# Option B: Embed FullFill App in Squarespace Website

If you want a Squarespace marketing site with the app embedded on one page.

---

## 🎯 Setup Overview

1. Deploy app to Vercel (at a subdomain like `app.fullfill-ai.com`)
2. Create Squarespace website with pages like Home, About, etc.
3. Embed the app on one page using an iframe or code block

---

## Step 1: Deploy App to Subdomain

### 1.1 Deploy to Vercel
1. Go to https://vercel.com
2. Deploy `ken-ngu/fullfill` frontend
3. Root Directory: `frontend`
4. Add Environment Variable:
   - `VITE_API_BASE_URL` = `https://api.fullfill-ai.com`

### 1.2 Add Subdomain to Vercel
1. Vercel → Settings → Domains
2. Add domain: `app.fullfill-ai.com`
3. Copy the CNAME record shown

### 1.3 Update Squarespace DNS
Go to Squarespace → DNS Settings, add:

```
Type: CNAME
Host: app
Value: cname.vercel-dns.com.
TTL: 3600
```

### 1.4 Deploy Backend to Railway
1. Deploy backend to Railway as usual
2. Add custom domain: `api.fullfill-ai.com`
3. Update Squarespace DNS:
```
Type: CNAME
Host: api
Value: [your-railway-url].up.railway.app.
TTL: 3600
```

---

## Step 2: Create Squarespace Website

### 2.1 Design Your Site
Create pages on Squarespace:
- **Home** (`fullfill-ai.com`) - Landing page with hero, features
- **About** (`fullfill-ai.com/about`) - Your story, mission
- **App** (`fullfill-ai.com/app`) - Embedded app (see Step 3)
- **Contact** - Contact form

### 2.2 Point Root Domain to Squarespace
In Squarespace DNS, make sure root domain points to Squarespace:

```
Type: A
Host: @
Value: 198.185.159.144 (Squarespace's IP)

Type: A
Host: @
Value: 198.185.159.145 (Squarespace's IP)

Type: CNAME
Host: www
Value: ext-cust.squarespace.com.
```

---

## Step 3: Embed App in Squarespace Page

### Method 1: Full-Page Embed (Recommended)

1. In Squarespace, create a new page: **App**
2. Set page URL: `/app`
3. Add a **Code Block** to the page
4. Paste this code:

```html
<style>
  /* Hide Squarespace header/footer for this page */
  #header, #footer {
    display: none !important;
  }

  /* Make iframe full-screen */
  body {
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  .sqs-block-code {
    padding: 0 !important;
  }
</style>

<iframe
  src="https://app.fullfill-ai.com"
  style="
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    border: none;
    overflow: hidden;
  "
  allow="clipboard-read; clipboard-write"
  title="FullFill App"
></iframe>
```

5. Save and publish

### Method 2: Embedded Section

If you want the app as part of a page with other content:

```html
<div style="width: 100%; height: 800px; margin: 40px 0;">
  <iframe
    src="https://app.fullfill-ai.com"
    style="
      width: 100%;
      height: 100%;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    "
    allow="clipboard-read; clipboard-write"
    title="FullFill App"
  ></iframe>
</div>
```

---

## Step 4: Update Navigation

In Squarespace:
1. Design → Navigation
2. Add menu items:
   - Home → `/`
   - About → `/about`
   - **App** → `/app`
   - Contact → `/contact`

---

## 🎯 Final Result

**Marketing pages on Squarespace:**
- `fullfill-ai.com` - Marketing landing page
- `fullfill-ai.com/about` - About page
- `fullfill-ai.com/app` - Full React app (embedded)

**Actual app hosted on Vercel:**
- `app.fullfill-ai.com` - Direct access to app

**Backend on Railway:**
- `api.fullfill-ai.com` - API endpoints

---

## ⚠️ Limitations of Embedding

**Pros:**
- ✅ Professional marketing site
- ✅ Squarespace's easy page builder
- ✅ Blog, contact forms, etc.

**Cons:**
- ❌ Iframe performance overhead
- ❌ More complex setup
- ❌ Squarespace monthly cost ($16-$49/month)
- ❌ SEO limitations for embedded content
- ❌ Mobile scrolling issues possible

---

## 💡 Recommended Structure

**For most users, we recommend:**

**Option A:** Point domain directly to Vercel
- Simplest setup
- Best performance
- Free hosting

**Only use Option B if:**
- You want a traditional marketing website with multiple pages
- You need Squarespace's page builder for non-technical team members
- You want blog/newsletter features built-in

Otherwise, stick with **Option A** (domain only) and build any marketing pages in your React app.

---

## 📊 Cost Comparison

| Setup | Monthly Cost |
|-------|--------------|
| **Option A (Domain only)** | $0 (just $20/year for domain) |
| **Option B (Full Squarespace)** | $16-49/month + domain |

---

## 🚀 Next Steps

If you want Option B:
1. Deploy app to `app.fullfill-ai.com` (follow Step 1)
2. Design Squarespace site
3. Embed app using code above (Step 3)

If you want Option A (recommended):
1. Follow **QUICK_DNS_SETUP.md** instead
2. Point domain directly to Vercel
3. Save $16-49/month!
