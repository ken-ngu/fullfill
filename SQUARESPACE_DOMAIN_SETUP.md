# Setting Up fullfill-ai.com with Squarespace

Complete guide to connect your Squarespace domain to Railway (backend) and Vercel (frontend).

---

## 🎯 **Goal:**
- **Frontend:** `fullfill-ai.com` → Vercel
- **Backend API:** `api.fullfill-ai.com` → Railway

---

## Step 1: Configure Frontend Domain on Vercel

### 1.1 Add Domain to Vercel
1. Go to your Vercel project dashboard
2. Click **Settings** → **Domains**
3. Add two domains:
   - `fullfill-ai.com`
   - `www.fullfill-ai.com`
4. Click **Add** for each

Vercel will show you DNS records to add. **Keep this page open.**

---

## Step 2: Configure DNS on Squarespace

### 2.1 Access Squarespace DNS Settings
1. Log into Squarespace
2. Go to **Settings** → **Domains**
3. Click on `fullfill-ai.com`
4. Click **DNS Settings**

### 2.2 Add DNS Records for Frontend (Vercel)

Add these records in Squarespace DNS:

**Record 1: Root domain (A record)**
- **Type:** A
- **Host:** @
- **Data:** `76.76.21.21` (Vercel's IP)
- **TTL:** 3600

**Record 2: WWW subdomain (CNAME)**
- **Type:** CNAME
- **Host:** www
- **Data:** `cname.vercel-dns.com.`
- **TTL:** 3600

**Record 3: Vercel verification (TXT)** *(Vercel will provide this)*
- **Type:** TXT
- **Host:** _vercel
- **Data:** `vc-domain-verify=...` (copy from Vercel)
- **TTL:** 3600

### 2.3 Add DNS Record for Backend (Railway)

**Record 4: API subdomain (CNAME)**
- **Type:** CNAME
- **Host:** api
- **Data:** `fullfill-backend.up.railway.app.` (your Railway domain)
- **TTL:** 3600

**Note:** Replace `fullfill-backend.up.railway.app` with your actual Railway backend URL.

---

## Step 3: Configure Backend Domain on Railway

### 3.1 Add Custom Domain
1. Go to your Railway project
2. Click on your **backend service**
3. Go to **Settings** → **Domains**
4. Click **+ Custom Domain**
5. Enter: `api.fullfill-ai.com`
6. Click **Add Domain**

Railway will verify the CNAME record automatically.

---

## Step 4: Update Environment Variables

### 4.1 Update Backend CORS on Railway
1. Go to Railway backend service
2. Click **Variables** tab
3. Update `CORS_ORIGINS`:
```
https://fullfill-ai.com,https://www.fullfill-ai.com,https://fullfill-*.vercel.app
```
4. Save and redeploy

### 4.2 Update Frontend API URL on Vercel
1. Go to Vercel project → **Settings** → **Environment Variables**
2. Update `VITE_API_BASE_URL`:
```
https://api.fullfill-ai.com
```
3. Click **Save**
4. Go to **Deployments** → Click **...** → **Redeploy**

---

## Step 5: Wait for DNS Propagation

DNS changes can take 5 minutes to 48 hours to propagate globally.

**Check status:**
```bash
# Check if A record is set
dig fullfill-ai.com

# Check if CNAME for API is set
dig api.fullfill-ai.com

# Check if CNAME for www is set
dig www.fullfill-ai.com
```

Or use online tool: https://dnschecker.org

---

## Step 6: Enable HTTPS (SSL)

### On Vercel (Automatic)
- Vercel automatically provisions SSL certificates
- Usually takes 5-10 minutes after DNS propagation
- Check status in Vercel → Settings → Domains

### On Railway (Automatic)
- Railway automatically provisions SSL for custom domains
- Usually takes 5-10 minutes after DNS propagation
- Check status in Railway → Settings → Domains

---

## 🎉 Final Result

After DNS propagation and SSL setup:

- **Main App:** https://fullfill-ai.com
- **With WWW:** https://www.fullfill-ai.com (redirects to main)
- **API Endpoint:** https://api.fullfill-ai.com/health
- **Data Sources:** https://fullfill-ai.com/data-sources
- **About Page:** https://fullfill-ai.com/about

---

## 📋 DNS Records Summary

Here's the complete DNS configuration for Squarespace:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | 76.76.21.21 | 3600 |
| CNAME | www | cname.vercel-dns.com. | 3600 |
| CNAME | api | fullfill-backend.up.railway.app. | 3600 |
| TXT | _vercel | vc-domain-verify=... | 3600 |

**Important Notes:**
- Make sure to add the trailing dot (`.`) in CNAME values
- Replace `fullfill-backend.up.railway.app` with your actual Railway URL
- The TXT record value comes from Vercel dashboard

---

## 🔧 Troubleshooting

### Domain not working after 24 hours?

**Check 1: Verify DNS records**
```bash
dig fullfill-ai.com
# Should show: 76.76.21.21

dig api.fullfill-ai.com CNAME
# Should show: fullfill-backend.up.railway.app
```

**Check 2: Verify Vercel domain status**
- Go to Vercel → Settings → Domains
- Should show green checkmark ✓
- If red X, check DNS records

**Check 3: Verify Railway domain status**
- Go to Railway → Settings → Domains
- Should show green checkmark ✓
- If pending, wait for DNS propagation

**Check 4: Clear browser cache**
```bash
# Chrome/Edge
Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

# Safari
Cmd+Option+R
```

**Check 5: Test API directly**
```bash
curl https://api.fullfill-ai.com/health
# Should return: {"status":"ok"}
```

### HTTPS not working?

Wait 10-15 minutes after DNS propagation. Both Vercel and Railway auto-provision SSL.

If still not working:
1. Remove domain from Vercel/Railway
2. Wait 5 minutes
3. Re-add domain
4. Wait for SSL provisioning

### CORS errors?

Update Railway backend `CORS_ORIGINS`:
```
https://fullfill-ai.com,https://www.fullfill-ai.com
```

Then redeploy backend.

---

## 🚀 Quick Verification Checklist

After setup, verify:

- [ ] `https://fullfill-ai.com` loads the app
- [ ] `https://www.fullfill-ai.com` redirects to main domain
- [ ] `https://api.fullfill-ai.com/health` returns `{"status":"ok"}`
- [ ] Search functionality works (frontend talks to backend)
- [ ] SSL lock icon shows in browser
- [ ] No CORS errors in browser console (F12)

---

## 🎯 Alternative: Point Squarespace to External Hosting

If you want Squarespace to just point to your hosting without managing content there:

### Option A: Use Squarespace as pure DNS
1. Keep website hosting on Vercel/Railway
2. Use Squarespace only for DNS management
3. Follow the DNS setup above ✓ (Recommended)

### Option B: Transfer domain away from Squarespace
1. Unlock domain in Squarespace
2. Get transfer authorization code
3. Transfer to Namecheap/Google Domains/Cloudflare
4. Update DNS there

**Note:** Option A is easier - keep domain on Squarespace, just update DNS records.

---

## 💰 Cost Breakdown

- **Domain (Squarespace):** ~$20/year
- **Frontend Hosting (Vercel):** $0/month (free tier)
- **Backend + DB (Railway):** $0/month (free tier)
- **SSL Certificates:** $0 (automatic)

**Total:** ~$20/year + $0/month = **$20/year** 🎉

---

## 📞 Need Help?

**Squarespace Support:**
- https://support.squarespace.com/hc/en-us/articles/205812378

**Vercel Support:**
- https://vercel.com/support

**Railway Support:**
- https://help.railway.app

**DNS Checker:**
- https://dnschecker.org
- https://www.whatsmydns.net

---

## 🎊 Success!

Once DNS propagates and SSL is active:

**Share your app:**
- https://fullfill-ai.com

**API Documentation:**
- https://api.fullfill-ai.com/docs

Now anyone can access FullFill! 🚀
