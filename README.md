# 🎯 Focus Champion

**Gamified Pomodoro Timer** | PWA + Android App

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue)](https://aliapps1.github.io/My-timer/)
[![Version](https://img.shields.io/badge/Version-2.0.0-green)]()
[![License](https://img.shields.io/badge/License-MIT-yellow)]()

---

## 📱 About

Focus Champion is a gamified Pomodoro timer that helps you improve focus and build productive habits.

### ✨ Features

- ⏱️ Timer presets: 5, 15, 25, 40, 60, 90 minutes
- 🌍 Three languages: English, Arabic, Persian (RTL support)
- 📅 Jalali, Gregorian and Hijri calendar
- 📊 Daily and weekly statistics
- 🔔 Background notifications
- 🔊 4 different alarm sounds
- 📲 Installable PWA
- 📱 Android APK

---

## 💰 Monetization Model

### 1. AdMob Ads (Main Income)
```
Session 1 & 2:  Free - no ads
Session 3+:     Interstitial Ad (triggered by user click ✅)
                After ad is dismissed, counter resets to 0
```
> **Google Policy:** Ads are only shown in response to user click ✅

### 2. Optional Donation (Secondary Income)
```
Users who want to support the creator
Via PayPal.me/aliapps
In the "Support Creator" section of the app
```
> **Note:** PayPal is NOT used for Premium purchase (Google Play policy) ✅

---

## 🏗️ Project Structure

```
My-timer/
├── index.html              ← Main app (v2.0)
├── manifest.json           ← PWA manifest
├── sw.js                   ← Service Worker v4
├── package.json            ← Capacitor + AdMob dependencies
├── capacitor.config.json   ← Capacitor & AdMob config
├── icon-*.png              ← Icons (72px to 512px)
└── .github/
    └── workflows/
        └── build-apk.yml   ← GitHub Actions APK builder
```

---

## 🚀 Deployment

### Web (GitHub Pages)
```
1. Edit index.html
2. Commit changes
3. Wait 5 minutes
4. Site updates automatically
```

### Android APK
```
1. Update files in GitHub
2. Actions → Build Android APK → Run workflow
3. Wait ~10 minutes
4. Download from Artifacts → FocusChampion-APK
```

---

## 📋 AdMob Setup (TODO)

- [ ] Create AdMob account: admob.google.com
- [ ] Add your app in AdMob
- [ ] Get your AD_UNIT_ID
- [ ] Replace in index.html:
  ```javascript
  const AD_UNIT_ID = 'YOUR_REAL_AD_UNIT_ID';
  ```
- [ ] Replace in capacitor.config.json:
  ```json
  "appId": "YOUR_ADMOB_APP_ID"
  ```
- [ ] Complete payment details in AdMob dashboard

---

## 📋 Google Play Setup (TODO)

- [ ] Google Play Console ($25): play.google.com/console
- [ ] Build signed APK / App Bundle
- [ ] Prepare screenshots
- [ ] Write app description
- [ ] Upload and Submit for review
- [ ] Wait 3–7 days for approval

---

## ⚠️ Important AdMob Rules

```
❌ NEVER click your own ads!
✅ Use Test Ad ID during development
✅ Complete payment details in AdMob
✅ Keep isTesting: true during development
✅ Set isTesting: false before publishing to Google Play
```

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| HTML/CSS/JS | ES6+ | Main App |
| Capacitor | 5.7.0 | PWA → Android |
| AdMob Plugin | 5.0.0 | Advertisements |
| Service Worker | v4 | PWA / Offline Cache |
| GitHub Actions | - | CI/CD APK Builder |

---

## 📞 Support & Links

- **Live App:** https://aliapps1.github.io/My-timer/
- **Support Creator:** https://paypal.me/aliapps

---

## 📄 License

MIT License — Free for personal and commercial use
