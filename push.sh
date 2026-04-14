#!/bin/bash
# MusicRight Mobile — One-click push script
# Usage: bash push.sh ghp_YOUR_TOKEN_HERE

TOKEN=$1

if [ -z "$TOKEN" ]; then
  echo "Usage: bash push.sh ghp_YOUR_TOKEN_HERE"
  echo ""
  echo "Get a token at: github.com → Settings → Developer settings → Personal access tokens → Tokens (classic)"
  echo "Required scope: repo"
  exit 1
fi

echo "🔗 Setting remote with token..."
git remote set-url origin "https://${TOKEN}@github.com/Search-AIII/musicright-mobile.git"

echo "🚀 Pushing 2 commits to claude/integrate-design-skills-G8jFn..."
git push -u origin claude/integrate-design-skills-G8jFn

if [ $? -eq 0 ]; then
  echo "✅ Push successful!"
  echo ""
  echo "Files pushed:"
  echo "  • app/(tabs)/_layout.tsx  — new tabs (Wallet, Social, AI)"
  echo "  • app/(tabs)/home.tsx     — premium dashboard"
  echo "  • app/(tabs)/wallet.tsx   — Stripe-style royalty wallet"
  echo "  • app/(tabs)/social.tsx   — DMCA + caption tools"
  echo "  • app/(tabs)/ai.tsx       — AI advisor (OpenRouter + SiliconFlow)"
  echo "  • lib/openrouter.ts       — AI API client + SecureStore"
else
  echo "❌ Push failed. Check your token has 'repo' scope."
fi

echo "🔒 Restoring proxy remote..."
git remote set-url origin "http://local_proxy@127.0.0.1:31918/git/Search-AIII/musicright-mobile"
echo "Done."
