# 📿 Tasbih Pro — Modern Responsive Digital Counter (PWA / React Native / Flutter)

A clean, responsive, mobile-first digital counter application designed for daily Dhikr, Tasbih, and general goal-oriented counting. Built with glassmorphic aesthetics, haptic vibration, synthetic physical click audio, target goal validation, and celebration confetti.

---

## ✨ Features & User Experience

1. **Full-Screen Tap Zone:**
   - The entire screen (excluding header & docked bottom controls) acts as an active tap zone.
   - Micro-scale pulse feedback on tap.
   - Ripple wave expands from exact touch/click coordinates (`(x, y)`).
   - Floating `+1` particle rises and dissolves.
   - Haptic vibration via `navigator.vibrate` and synthetic audio feedback via Web Audio API (100% offline, zero audio file dependencies).

2. **Target Validation & Lock Logic (Crucial):**
   - **Guaranteed Validation:** Tapping the screen without setting a valid positive integer target **strictly prevents incrementing**.
   - Triggers an animated warning modal (*"Please set a target goal first to begin counting!"*) with a shake animation, warning audio cue, and direct focus on the target input.
   - Preset chips (`33`, `99`, `100`, `313`, `1000`) allow instant one-tap goal selection.

3. **Celebration Effect:**
   - Multi-colored confetti burst powered by a zero-dependency Canvas Confetti engine.
   - Celebratory victory arpeggio chime via Web Audio API.
   - Celebration modal displaying completed count and round/lap number.
   - Options to:
     - *Start Next Round* (increments lap, resets count to 0, retains goal)
     - *Continue Counting Beyond Target*
     - *Set New Target Goal*

4. **Docked Control Card:**
   - Docked unobtrusively at the bottom with safe area insets for notched mobile devices.
   - Target input field with clear button.
   - **Set Target** confirm button.
   - **Reset** button with a confirmation modal (*"Are you sure you want to clear your count of X?"*) to prevent accidental taps.

5. **Aesthetics & Themes:**
   - 4 switchable color themes:
     - 🌿 **Emerald Sanctuary** (Rich Islamic dark green & gold)
     - 🌌 **Midnight Obsidian** (Deep OLED black & indigo/violet)
     - 👑 **Royal Gold** (Onyx black & warm amber gold)
     - ⚪ **Pearl Minimalist** (Clean high-contrast light mode)
   - SVG Circular Progress Ring with smooth gradient glow.
   - Mobile gestures: `user-select: none`, `touch-action: manipulation`, no double-tap-to-zoom.

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
- **iOS (Safari):** Tap the Share button ➔ Select **"Add to Home Screen"**.
- **Android (Chrome):** Tap the three dots menu ➔ Select **"Install App"** or **"Add to Home Screen"**.

---

## 📦 Android APK (Ready to Install)

The native Android APK has been compiled and published:

- **Direct GitHub Release Download:** [**Download `tasbih-pro.apk` (v1.0.0)**](https://github.com/shuvon02/digital-tasbih-counter/releases/download/v1.0.0/tasbih-pro.apk)
- **GitHub Release Page:** [https://github.com/shuvon02/digital-tasbih-counter/releases/tag/v1.0.0](https://github.com/shuvon02/digital-tasbih-counter/releases/tag/v1.0.0)
- **Local File in Repository:** [`tasbih-pro.apk`](file:///d:/tasbih/tasbih-pro.apk) (3.88 MB)
- **Local Network Wi-Fi Download:** If your phone and PC are on the same Wi-Fi, open this URL on your phone browser:
  ```
  http://192.168.0.102:3000/tasbih-pro.apk
  ```

### How to Install on Android:
1. Transfer `tasbih-pro.apk` to your phone via USB, Google Drive, WhatsApp, or by downloading it from the local server link above.
2. Tap the downloaded `.apk` file on your phone.
3. If prompted, allow *"Install from unknown sources"* or *"Install unknown apps"*.
4. Tap **Install** and enjoy Tasbih Pro natively on your mobile phone!

| Platform | Location | Description |
|---|---|---|
| **PWA / Web** | [`index.html`](file:///d:/tasbih/index.html), [`styles.css`](file:///d:/tasbih/styles.css), [`app.js`](file:///d:/tasbih/app.js) | Full-screen PWA with Web Audio, SVG ring, canvas confetti & local storage |
| **React Native** | [`react_native/TasbihCounterScreen.tsx`](file:///d:/tasbih/react_native/TasbihCounterScreen.tsx) | Complete TypeScript component with `Pressable`, `Animated`, `Vibration`, & modal handling |
| **Flutter** | [`flutter/tasbih_counter_screen.dart`](file:///d:/tasbih/flutter/tasbih_counter_screen.dart) | Complete Dart widget with `HapticFeedback`, `AnimationController`, & circular progress |

---

## ⌨️ Desktop Keyboard Shortcuts

- **Spacebar**: Tap to increment counter
- **T**: Focus target input
- **R**: Trigger Reset confirmation modal
- **Enter** (while typing target): Lock in target goal
- **Escape**: Close any active modal
