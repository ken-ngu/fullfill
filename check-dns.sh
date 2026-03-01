#!/bin/bash

echo "🔍 Checking DNS Propagation for fullfill-ai.com..."
echo ""

echo "1. Root domain (fullfill-ai.com):"
dig +short fullfill-ai.com A
echo ""

echo "2. WWW subdomain (www.fullfill-ai.com):"
dig +short www.fullfill-ai.com CNAME
echo ""

echo "3. API subdomain (api.fullfill-ai.com):"
dig +short api.fullfill-ai.com CNAME
echo ""

echo "4. Test API endpoint:"
curl -s https://api.fullfill-ai.com/health 2>&1 | head -1
echo ""

echo "---"
echo "✅ If you see IP addresses and domain names above, DNS is propagating!"
echo "⏳ If empty or errors, wait a few more minutes and run this script again."
echo ""
echo "Check global propagation: https://dnschecker.org/#A/fullfill-ai.com"
