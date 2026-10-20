# 📿 Tasbih Pro v1.1.0 — Advanced Digital Counter & Dhikr Companion

A clean, responsive, mobile-first digital counter and Tasbih application designed for daily Dhikr, post-prayer recitations, and goal-oriented habit tracking. Features Arabic calligraphy, the 33-33-34 Auto-Chain mode, physical bead notches, multi-sound acoustic profiles, daily streaks tracking, and Zen focus mode.

Available as a **Native Android APK**, an **Offline-First PWA**, and clean **React Native** & **Flutter** components.

---

## 🌟 What's New in v1.1.0

1. **📿 Arabic Calligraphy & Dhikr Library:**
   - Real-time Arabic calligraphy rendered using Google Font **Amiri**.
   - Displays Arabic phrase, English transliteration, and meaning with a gold shimmer animation on each tap.
   - Presets: *SubhanAllah (33)*, *Alhamdulillah (33)*, *Allahu Akbar (34)*, *Astaghfirullah (100)*, *La ilaha illallah (100)*, *Durood (100)*, and custom counters.

2. **⚡ Auto-Chain Mode (Tasbih of Fatimah):**
   - Seamlessly guides you through the traditional post-prayer sequence:
     1. **SubhanAllah** (33) ➔
     2. **Alhamdulillah** (33) ➔
     3. **Allahu Akbar** (34) ➔
     4. Grand Confetti Celebration upon completing 100 recitations!

3. **🟢 33 Physical Beads on Progress Ring:**
   - 33 interactive bead notches positioned around the circular SVG track.
   - Beads illuminate with an emerald glow as you progress, with the current bead pulsing in warm gold.

4. **🪵 Multi-Sound Synthesizer Profiles (100% Offline):**
   - 🪵 **Wooden Bead Click** (Authentic resonant acoustic woodblock)
   - 💧 **Water Droplet** (Meditative zen pebble drop)
   - ⚙️ **Mechanical Tally Clicker** (Crisp tactile click)
   - 🎵 **Gentle Chime** (Soft harmonic bell tone)
   - 🔕 **Mute / Silent** (Haptics only)

5. **🔥 Daily History & Streaks Drawer:**
   - Tap the stats icon to track consecutive active days (`🔥 Daily Streak`).
   - Today's Total counts and Lifetime all-time tally.
   - Breakdown of counts by specific Dhikr phrase.

6. **🧘 Zen / Focus Mode:**
   - Tap the Focus icon (or press `Z`) to hide all headers and control cards.
   - Provides an OLED pure-black screen with glowing Arabic calligraphy and ripple waves for distraction-free night recitations.

---

## 📦 Download Android APK (v1.1.0)

- **Direct GitHub Download:** [**Download `tasbih-pro.apk`**](https://github.com/shuvon02/digital-tasbih-counter/releases/download/v1.1.0/tasbih-pro.apk)
- **GitHub Release Page:** [https://github.com/shuvon02/digital-tasbih-counter/releases/tag/v1.1.0](https://github.com/shuvon02/digital-tasbih-counter/releases/tag/v1.1.0)
- **Local File in Repository:** [`tasbih-pro.apk`](file:///d:/tasbih/tasbih-pro.apk) (~3.03 MB signed release build)

---

## 🚀 Running the Web App / PWA Locally

The web application runs with standard HTML5, CSS3, and ES6 JavaScript. A zero-dependency Node HTTP server is included:

```bash
# Start local server
npm start
# or
node server.js
```

Open your browser at:
```
http://localhost:3000
```

### Installing as a Mobile PWA
- **Android (Chrome):** Tap three dots menu (⋮) ➔ Select **"Install App"** or **"Add to Home Screen"**.
- **iOS (Safari):** Tap the Share button ➔ Select **"Add to Home Screen"**.

---

## 📱 Multi-Platform Implementations Included

| Platform | Location | Description |
|---|---|---|
| **PWA / Web** | [`index.html`](file:///d:/tasbih/index.html), [`styles.css`](file:///d:/tasbih/styles.css), [`app.js`](file:///d:/tasbih/app.js) | Advanced PWA with Web Audio, beads ring, auto-chain & history |
| **Android APK** | [`tasbih-pro.apk`](file:///d:/tasbih/tasbih-pro.apk) | Signed Release APK (API 34/35 compatible) |
| **React Native** | [`react_native/TasbihCounterScreen.tsx`](file:///d:/tasbih/react_native/TasbihCounterScreen.tsx) | Complete TypeScript screen with `Animated`, `Vibration`, & modal handling |
| **Flutter** | [`flutter/tasbih_counter_screen.dart`](file:///d:/tasbih/flutter/tasbih_counter_screen.dart) | Complete Dart widget with `HapticFeedback`, `AnimationController`, & circular progress |

---

## ⌨️ Desktop Shortcuts

- **Spacebar / ArrowUp**: Tap to increment counter
- **T**: Focus target input
- **R**: Trigger Reset confirmation modal
- **Z**: Toggle Zen Focus Mode
- **Escape**: Close modals or exit Zen Mode
