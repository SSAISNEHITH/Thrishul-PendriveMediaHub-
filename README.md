# Pendrive Media Hub PRO 🚀

A modern, serverless, and 100% secure web application that connects directly to your USB Pen Drive, letting you play songs, watch videos, and read PDFs with ultra-premium sound, full Bluetooth hardware remote controls, and smart metadata sorting.

Built with the **File System Access API** and the **W3C Media Session API**, this app operates entirely client-side with strict **read-only** permissions. Your files are never uploaded, copied, or modified.

---

## ✨ Pro Features

- **📶 Bluetooth Hardware Remote (AVRCP)**: Full playback control directly from connected Bluetooth speakers, Bluetooth headphones, smartwatches, and car stereo systems (Play, Pause, Next Track, Previous Track, Seek, and Volume).
- **🎨 Bluetooth Album Artwork & Metadata**: Transmits live track title, movie/album name, hero/actor, and singer to Bluetooth speaker displays and lock screens with auto-generated HD dynamic canvas cover art.
- **🔍 Instant Universal Search & Click-to-Play**: Search in real time by Song Title, Movie/Album Name, Hero/Actor, Singer, or Folder. Clicking any search result immediately plays the track and synchronizes the playback queue.
- **🔀 Multi-Criteria Sorting**:
  - 🎵 Song Title (A to Z / Z to A)
  - 🎬 Movie / Album Name (A to Z)
  - 🌟 Hero / Actor Name (A to Z)
  - 🎤 Singer / Music Director Name (A to Z)
  - 📁 Original USB Pen Drive Folder Order
- **📂 Smart Grouping Views**:
  - Group by Movie (with movie reel badges & 1-click "Play Group")
  - Group by Hero / Actor (Tollywood, Bollywood, Kollywood, Sandalwood & International stars)
  - Group by Singer & Music Director
  - Group by Pen Drive Directory Folder
- **📑 Grid & List View Modes**: Toggle between visual album cards with vinyl animations and detailed Spotify-style tabular list view.
- **🎧 Pro Audio Player Dock**:
  - Interactive custom seek bar with buffered stream visualization
  - Smooth 2-second auto-play transition gap between songs
  - Shuffle mode and 3-state Repeat mode (Off / Repeat All / Repeat Track)
  - Volume control with mute toggle
  - Slide-out Play Queue drawer
- **⚡ Offline & Serverless**: Zero backend dependencies, no databases, works completely offline.
- **🛡️ 100% Safe & Read-Only**: Files remain untouched on your USB drive.
- **🧪 Demo Mode & Cross-Browser Fallback**: Includes a built-in synthesized demo media library for instant testing, plus a universal folder picker compatible with all browsers and mobile devices.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| **`Space`** or **`K`** | Play / Pause toggle |
| **`N`** | Next track (in active queue) |
| **`P`** | Previous track |
| **`→`** / **`←`** | Seek forward / backward by 5 seconds |
| **`M`** | Mute / Unmute audio |
| **`/`** | Focus search input |
| **`Esc`** | Exit search input / close drawer |

---

## 🛠️ Technologies Used

- **HTML5 & Vanilla JavaScript (ES6+)**: Modular client-side architecture with zero external runtime dependencies.
- **CSS3 (Custom Design System)**: Glassmorphism, CSS grid, glowing neon accents, and responsive micro-animations.
- **Media Session API**: W3C standard for Bluetooth speaker buttons, car consoles, smartwatches, and Windows/Android media flyouts.
- **File System Access API**: Secure `window.showDirectoryPicker({ mode: 'read' })` with fallback for `<input webkitdirectory>`.
- **Pure JS Binary ID3 Parser**: Directly reads ID3v2/ID3v1 tags and embedded album art from the file slice without excessive memory consumption.
- **Canvas 2D API**: High-resolution 512x512 dynamic artwork generation for Bluetooth device display.

---

## 🚀 How to Run

1. Open `index.html` directly in Google Chrome, Microsoft Edge, Brave, or any modern Chromium browser.
2. Click **Connect Pen Drive** and select your USB drive root folder.
3. Grant "View files" permission when prompted.
4. Pair your Bluetooth speaker or headphones and enjoy total remote-controlled playback!

*(Optional: Click **"Try Demo Media"** to immediately test all search, sort, and Bluetooth features without connecting a physical drive.)*

---

## 📝 License

This project is licensed under the MIT License.
