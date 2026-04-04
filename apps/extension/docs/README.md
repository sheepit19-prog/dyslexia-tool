# Chrome Web Store Publication - Quick Start

## 📋 What You Need

| Item | Status | File Reference |
|------|--------|----------------|
| Privacy Policy URL | ⬜ Needed | See `PRIVACY_POLICY.md` + `HOSTING_GUIDE.md` |
| PNG Icons (16, 48, 128px) | ⬜ Needed | Run `scripts/convert-icons.ps1` |
| Screenshots (3-4) | ⬜ Needed | See `SCREENSHOT_GUIDE.md` |
| Developer Account ($5) | ⬜ Needed | https://chrome.google.com/webstore/devconsole |
| Store Listing Copy | ✅ Ready | See `STORE_LISTING.md` |
| Data Safety Answers | ✅ Ready | See `DATA_SAFETY_FORM.md` |
| Publication Checklist | ✅ Ready | See `PUBLICATION_CHECKLIST.md` |

---

## 🚀 Quick Start (2-3 Hours Total)

### Step 1: Generate Icons (30 min)
```powershell
# From project root
.\apps\extension\scripts\convert-icons.ps1 -InstallDependencies
```

### Step 2: Host Privacy Policy (30 min)
1. Create GitHub repo (if you don't have one)
2. Push `docs/PRIVACY_POLICY.md` to repo
3. Enable GitHub Pages
4. Copy your privacy policy URL

### Step 3: Take Screenshots (45 min)
1. Load extension locally: `chrome://extensions` → Load unpacked → select `dist/`
2. Follow `SCREENSHOT_GUIDE.md` to capture 3-4 screenshots
3. Save to `docs/screenshots/`

### Step 4: Create Developer Account (15 min)
1. Go to https://chrome.google.com/webstore/devconsole
2. Sign in with Google account
3. Pay $5 fee

### Step 5: Submit (45 min)
1. Follow `PUBLICATION_CHECKLIST.md`
2. Upload ZIP from `dist/` folder
3. Copy store listing from `STORE_LISTING.md`
4. Complete data safety form using `DATA_SAFETY_FORM.md`
5. Submit for review

---

## 📁 All Documentation Files

```
apps/extension/docs/
├── PRIVACY_POLICY.md       ← Your privacy policy (edit contact info)
├── HOSTING_GUIDE.md        ← How to host privacy policy
├── STORE_LISTING.md        ← Store description, tags, category
├── DATA_SAFETY_FORM.md     ← Answers for data safety form
├── SCREENSHOT_GUIDE.md     ← What screenshots to take
├── PUBLICATION_CHECKLIST.md ← Step-by-step submission guide
└── README.md               ← This file
```

---

## ⚠️ Before You Submit

- [ ] Privacy policy URL is publicly accessible
- [ ] PNG icons generated (16, 48, 128px)
- [ ] 3-4 screenshots captured (1280x800)
- [ ] Developer account created ($5 paid)
- [ ] Extension builds without errors: `npm run build`
- [ ] All tests pass: `npm test`
- [ ] Tested locally in Chrome

---

## 📞 Need Help?

- **Privacy Policy Questions:** See `PRIVACY_POLICY.md`
- **Icon Generation:** See `icons/README.md`
- **Screenshots:** See `SCREENSHOT_GUIDE.md`
- **Store Listing:** See `STORE_LISTING.md`
- **Data Safety Form:** See `DATA_SAFETY_FORM.md`
- **Full Submission:** See `PUBLICATION_CHECKLIST.md`

---

## 🎯 Timeline

| Task | Time | When |
|------|------|------|
| Generate icons | 30 min | Day 1 |
| Host privacy policy | 30 min | Day 1 |
| Take screenshots | 45 min | Day 1-2 |
| Create developer account | 15 min | Day 2 |
| Submit to store | 45 min | Day 2 |
| Review process | 3-7 days | After submission |

**Total Active Work:** ~2.5 hours
**Total Time to Live:** ~1 week (including review)

---

Good luck! 🚀
