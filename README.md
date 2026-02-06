# 🎯 Focus Timer Pro

<div align="center">

![Focus Timer Pro](icon-192.png)

**A beautiful, multilingual Pomodoro timer to boost your productivity**

[🌐 Live Demo](#) | [📱 Install App](#) | [📖 Documentation](#features)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat&logo=pwa&logoColor=white)

</div>

---

## ✨ Features

### ⏱️ Timer Functionality
- **Pre-set Time Modes**: 5m, 15m, 25m (Pomodoro), 40m, 60m, 90m
- **Background Timer**: Continues running even when you close the tab
- **Smart Sync**: Automatically adjusts time when you return to the app
- **Audio Alerts**: Customizable notification sounds
- **Visual Progress**: Real-time progress bar

### 📊 Statistics & Tracking
- **Daily Focus Time**: Track minutes completed today
- **Weekly Overview**: See your total focus time for the week
- **Streak Counter**: Build and maintain your productivity streak
- **Persistent Data**: Stats saved locally and never lost

### 🌍 Multilingual Support
- **English** (EN)
- **فارسی** - Persian (FA)
- **العربية** - Arabic (AR)
- RTL (Right-to-Left) support for Persian and Arabic

### 📱 Progressive Web App (PWA)
- **Install on Device**: Works like a native app
- **Offline Support**: Full functionality without internet
- **Push Notifications**: Get alerted when timer completes
- **Cross-Platform**: Works on Android, iOS, Desktop

### 🎨 Beautiful Design
- Modern gradient UI
- Smooth animations
- Responsive layout
- Clean, minimal interface

---

## 🚀 Quick Start

### Option 1: Use Online
Simply visit the live demo and start using immediately!

**🧪 Test Features:**
- **[⚡ Quick Test](quick-test.html)** - 5-second timer to test sound, vibration & notifications
- **[🔊 Sound Test](sound-test.html)** - Test audio functionality only
- **[📱 Notification Guide](notification-guide.html)** - Complete setup instructions (multilingual)

### Option 2: Install as App
1. Open the website in Chrome (Android) or Safari (iOS)
2. Tap "Add to Home Screen"
3. Launch from your home screen like any app

### Option 3: Run Locally
```bash
# Clone the repository
git clone https://github.com/aliapps1/My-timer.git

# Navigate to directory
cd My-timer

# Open index.html in your browser
# Or use a local server:
python -m http.server 8000
# Then visit: http://localhost:8000
```

---

## 📱 Publishing to Google Play

This app is ready for Google Play Store! Follow these steps:

### Method 1: Using PWA Builder (Easiest)
1. Go to [PWABuilder.com](https://www.pwabuilder.com/)
2. Enter your app URL
3. Click "Package For Stores"
4. Select "Android" and download the package
5. Upload to Google Play Console

### Method 2: Using Bubblewrap
```bash
# Install Bubblewrap
npm install -g @bubblewrap/cli

# Initialize project
bubblewrap init --manifest https://your-domain.com/manifest.json

# Build APK
bubblewrap build

# The APK will be in the output folder
```

### Method 3: Using Capacitor
```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli

# Initialize
npx cap init

# Add Android platform
npx cap add android

# Copy web assets
npx cap copy

# Open in Android Studio
npx cap open android
```

### Google Play Requirements Checklist
- [x] Privacy Policy (see `privacy-policy.html`)
- [x] App Icons (all sizes included)
- [x] PWA Manifest
- [x] Service Worker
- [ ] Developer Account ($25 one-time fee)
- [ ] Screenshots (540x720, 1080x1920)
- [ ] Feature Graphic (1024x500)
- [ ] App Description

---

## 📂 Project Structure

```
Focus-Timer-Pro/
├── index.html              # Main HTML file
├── app.js                  # Application logic
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── privacy-policy.html     # Privacy policy
├── icon-*.png             # App icons (8 sizes)
├── generate_icons.py      # Icon generator script
└── README.md              # This file
```

---

## 🛠️ Technical Details

### Technologies Used
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with gradients
- **Vanilla JavaScript**: No frameworks needed
- **LocalStorage API**: Data persistence
- **Service Worker**: Offline functionality
- **Web Notifications API**: Timer alerts
- **Web Share API**: Share results

### Browser Support
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers

### Performance
- 📦 **Bundle Size**: < 50KB total
- ⚡ **Load Time**: < 1 second
- 🔋 **Battery Efficient**: Minimal CPU usage
- 💾 **Storage**: < 1MB

---

## 🎯 How It Works

### Timer Logic
The app uses a smart synchronization system:

1. When you start a timer, it calculates the exact end time
2. Stores this end time in localStorage
3. Every 500ms, checks current time vs end time
4. This ensures accuracy even if:
   - Tab is in background
   - Device goes to sleep
   - Browser is closed and reopened

### Data Persistence
```javascript
// Stats structure in localStorage
{
  todayMin: 45,              // Minutes completed today
  weekMin: 180,              // Weekly total
  streak: 7,                 // Days in a row
  lastActiveDate: "2026-02-06",
  weeklyData: {
    "2026-02-06": 45,
    "2026-02-05": 60,
    // ...
  }
}
```

---

## 🌟 Features Roadmap

### Planned Features
- [ ] **Dark Mode**: Toggle between light/dark themes
- [ ] **Custom Timers**: Set your own time durations
- [ ] **Sound Library**: More notification sound options
- [ ] **Categories**: Tag sessions by type (work, study, etc.)
- [ ] **Charts**: Visualize your productivity over time
- [ ] **Break Reminders**: Auto-start break timers
- [ ] **Focus Sessions**: Pomodoro with automatic breaks
- [ ] **Export Data**: Download your stats as CSV
- [ ] **Themes**: Customizable color schemes
- [ ] **Achievements**: Unlock badges for milestones

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Setup
```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/My-timer.git

# Create a branch
git checkout -b my-new-feature

# Make changes and test locally
# Open index.html in browser

# Commit and push
git add .
git commit -m "Description of changes"
git push origin my-new-feature
```

---

## 📄 License

This project is licensed under the **MIT License** - see below:

```
MIT License

Copyright (c) 2026 Focus Timer Pro

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👨‍💻 Author

**aliapps1**
- GitHub: [@aliapps1](https://github.com/aliapps1)
- Project: [My-timer](https://github.com/aliapps1/My-timer)

---

## 🙏 Acknowledgments

- Inspired by the Pomodoro Technique
- Icons generated with Python & Pillow
- Built with ❤️ for productivity enthusiasts

---

## 📞 Support

If you encounter any issues or have questions:

1. **Check the [Issues](https://github.com/aliapps1/My-timer/issues)** page
2. **Open a new issue** with details
3. **Star ⭐ the repo** if you find it useful!

---

<div align="center">

**Made with ❤️ and ☕**

[⬆ Back to Top](#-focus-timer-pro)

</div>
