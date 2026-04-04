# Privacy Policy Hosting Guide

Your privacy policy needs a publicly accessible URL for Chrome Web Store submission.

## Option 1: GitHub Pages (Recommended - Free)

### Steps:

1. **Create a GitHub repository** (if you don't have one):
   ```bash
   # In your project root
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/dyslexia-tool.git
   git branch -M main
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under "Source", select **main** branch → **/docs** folder (or root)
   - Click **Save**

4. **Move privacy policy to docs folder** (if needed):
   ```bash
   # From project root
   mv apps/extension/docs/PRIVACY_POLICY.md docs/
   ```

5. **Your privacy policy URL will be**:
   ```
   https://YOUR_USERNAME.github.io/dyslexia-tool/PRIVACY_POLICY.html
   ```

### Convert MD to HTML (Optional):

GitHub Pages renders Markdown, but for a professional look:

```bash
# Use an online converter or:
npm install -g markdown-pdf
markdown-pdf apps/extension/docs/PRIVACY_POLICY.md
```

---

## Option 2: Host on Your Website

If you have a personal/project website:

1. Upload `PRIVACY_POLICY.md` (or convert to HTML)
2. Place at: `yourwebsite.com/dyslexia-tool-privacy`
3. URL: `https://yourwebsite.com/dyslexia-tool-privacy`

---

## Option 3: Free Privacy Policy Hosting Services

- **TermsFeed**: https://www.termsfeed.com/ (free tier available)
- **PrivacyPolicies.com**: https://www.privacypolicies.com/ (free tier)
- **GitHub Gist**: https://gist.github.com/ (raw file URL)

---

## For Chrome Web Store Submission

You'll need to provide:

1. **Privacy Policy URL**: (from above)
2. **Developer Contact Email**: Your email address
3. **Data Safety Form**: See `DATA_SAFETY_FORM.md`

---

## Quick Setup Script

```bash
# Create docs folder at project root
mkdir -p docs

# Copy privacy policy
cp apps/extension/docs/PRIVACY_POLICY.md docs/

# If using GitHub Pages with /docs folder - you're done!
# Your URL: https://USERNAME.github.io/REPO_NAME/docs/PRIVACY_POLICY.html
```

---

## Testing Your Privacy Policy URL

Before submitting:

1. Open the URL in an incognito window
2. Verify it loads without authentication
3. Check it's readable on mobile
4. Ensure it's not blocked by robots.txt
