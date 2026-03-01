# Quick DNS Setup for fullfill-ai.com

## 🎯 What You're Setting Up:
```
fullfill-ai.com          → Vercel (Frontend)
www.fullfill-ai.com      → Vercel (Frontend)
api.fullfill-ai.com      → Railway (Backend)
```

---

## ✅ Step-by-Step Checklist

### ☐ Step 1: Deploy to Railway (Backend)
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `ken-ngu/fullfill`
5. Wait for deployment to complete
6. Click on backend service → Settings → "Generate Domain"
7. **Copy your Railway URL:** `___________________.up.railway.app`

### ☐ Step 2: Deploy to Vercel (Frontend)
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Select `ken-ngu/fullfill`
5. Root Directory: `frontend`
6. Add Environment Variable:
   - Name: `VITE_API_BASE_URL`
   - Value: `https://[your-railway-url].up.railway.app`
7. Click "Deploy"

### ☐ Step 3: Add Domain to Vercel
1. In Vercel project → Settings → Domains
2. Add `fullfill-ai.com` → Click "Add"
3. Add `www.fullfill-ai.com` → Click "Add"
4. **Copy the verification TXT record** Vercel shows you

### ☐ Step 4: Configure Squarespace DNS
1. Log into Squarespace
2. Settings → Domains → `fullfill-ai.com` → DNS Settings
3. **Add these 4 DNS records:**

```
┌─────────────────────────────────────────────────────────────┐
│ Record 1: Root Domain                                       │
├─────────────────────────────────────────────────────────────┤
│ Type:  A                                                    │
│ Host:  @                                                    │
│ Value: 76.76.21.21                                          │
│ TTL:   3600                                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Record 2: WWW Subdomain                                     │
├─────────────────────────────────────────────────────────────┤
│ Type:  CNAME                                                │
│ Host:  www                                                  │
│ Value: cname.vercel-dns.com.                                │
│ TTL:   3600                                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Record 3: Vercel Verification                               │
├─────────────────────────────────────────────────────────────┤
│ Type:  TXT                                                  │
│ Host:  _vercel                                              │
│ Value: vc-domain-verify=XXXXXXXXXXXXX (from Vercel)        │
│ TTL:   3600                                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Record 4: API Subdomain (Backend)                           │
├─────────────────────────────────────────────────────────────┤
│ Type:  CNAME                                                │
│ Host:  api                                                  │
│ Value: [your-railway-url].up.railway.app.                   │
│ TTL:   3600                                                 │
└─────────────────────────────────────────────────────────────┘
```

**⚠️ Important:**
- Don't forget the trailing dot (`.`) in CNAME values!
- Replace `[your-railway-url]` with your actual Railway domain

### ☐ Step 5: Add Custom Domain to Railway
1. Go to Railway → Your backend service
2. Settings → Domains → "+ Custom Domain"
3. Enter: `api.fullfill-ai.com`
4. Click "Add Domain"

### ☐ Step 6: Update CORS on Railway
1. Railway backend service → Variables
2. Update `CORS_ORIGINS` to:
```
https://fullfill-ai.com,https://www.fullfill-ai.com
```
3. Redeploy backend

### ☐ Step 7: Update API URL on Vercel
1. Vercel project → Settings → Environment Variables
2. Update `VITE_API_BASE_URL` to:
```
https://api.fullfill-ai.com
```
3. Go to Deployments → Click "..." → "Redeploy"

### ☐ Step 8: Wait & Verify
- **Wait 10-30 minutes** for DNS propagation
- Test: https://fullfill-ai.com (should load your app)
- Test: https://api.fullfill-ai.com/health (should return `{"status":"ok"}`)

---

## ⏱️ Timeline

| Task | Time |
|------|------|
| Deploy to Railway | 3-5 min |
| Deploy to Vercel | 2-3 min |
| Configure DNS | 5 min |
| DNS Propagation | 10-30 min |
| SSL Certificate | 5-10 min |
| **Total** | **25-53 min** |

---

## 🔍 Verification Commands

After setup, run these in your terminal:

```bash
# Check root domain
dig fullfill-ai.com
# Should show: 76.76.21.21

# Check API subdomain
dig api.fullfill-ai.com
# Should show: your-railway-url.up.railway.app

# Test API
curl https://api.fullfill-ai.com/health
# Should return: {"status":"ok"}
```

Or use web tool: https://dnschecker.org

---

## ❌ Common Issues

**Issue 1: "Domain not verified" on Vercel**
- ✅ Solution: Wait 30 minutes for DNS propagation
- ✅ Make sure TXT record is correct

**Issue 2: "SSL Certificate Error"**
- ✅ Solution: Wait 15 minutes after DNS propagates
- ✅ Both Vercel and Railway auto-provision SSL

**Issue 3: "CORS Error" in browser console**
- ✅ Solution: Check Railway `CORS_ORIGINS` includes your domain
- ✅ Redeploy backend after updating

**Issue 4: API not connecting**
- ✅ Solution: Verify `VITE_API_BASE_URL` on Vercel
- ✅ Test API directly: `curl https://api.fullfill-ai.com/health`

---

## 🎉 Done!

Your app will be live at:
- **https://fullfill-ai.com**

Share it with the world! 🚀

---

## 💡 Pro Tips

1. **Enable analytics:** Add Google Analytics or Plausible to track usage
2. **Set up monitoring:** Use Vercel Analytics + Railway metrics
3. **Custom domain email:** Use Google Workspace or Zoho for team@fullfill-ai.com
4. **Social media:** Create Twitter, LinkedIn pages for FullFill
5. **SEO:** Update meta tags in `frontend/index.html` with your domain

---

**Need detailed help?** See `SQUARESPACE_DOMAIN_SETUP.md` for full guide.
