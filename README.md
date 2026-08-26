# Pendrive Media Hub 🚀

A modern, serverless, and 100% secure web application that allows you to connect your USB Pen Drive and instantly play songs, watch videos, and read PDFs directly in your browser. 

Built with the modern **File System Access API**, this app operates entirely on the client side with strict **read-only** permissions. This guarantees that your original files are never altered, moved, or deleted.

## ✨ Features

- **100% Secure & Read-Only**: Accesses your files safely without copying them or risking data manipulation.
- **Serverless Architecture**: Runs entirely in the browser. No backend, no databases, no installations required.
- **Premium User Interface**: A sleek, modern dark mode design featuring glassmorphism and gold/cyan accents.
- **Smart Audio Player**: Includes a persistent audio player with Next/Previous controls and a 2-second auto-play transition between tracks.
- **Auto-Categorization**: Automatically scans your selected directory and sorts files into Songs, Videos, and PDFs.
- **Search Functionality**: Quickly filter through your files by name.

## 🛠️ Technologies Used

- **HTML5**: Application structure and media elements (`<audio>`, `<video>`, `<iframe>`).
- **CSS3**: Custom properties (variables), Flexbox/Grid layouts, and glassmorphism styling.
- **JavaScript (ES6+)**: Core logic, DOM manipulation, and asynchronous operations.
- **File System Access API**: `window.showDirectoryPicker()` to securely request and read local directories.
- **FontAwesome**: For beautiful, scalable UI icons.

## 🚀 How to Run

Because this application relies on the File System Access API, it **must** be run on a modern Chromium-based browser (such as Google Chrome, Microsoft Edge, or Brave).

1. Clone this repository or download the source code.
2. Open the `index.html` file in your browser.
3. Click the **Connect Pen Drive** button.
4. Select the root folder of your connected USB drive when prompted.
5. Grant the browser permission to "View files".
6. Enjoy your media!

## 🧠 How It Works

The core of this application relies on the browser's ability to safely request local file handles:
1. We invoke `window.showDirectoryPicker({ mode: 'read' })` to ask the user for a folder.
2. We recursively iterate through the directory, filtering for supported extensions (`.mp3`, `.wav`, `.mp4`, `.pdf`, etc.).
3. We utilize `URL.createObjectURL(file)` to generate a safe, temporary reference that the browser can use as a source for audio, video, or iframe elements. 
4. Memory is managed carefully by revoking object URLs when they are no longer needed.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](../../issues).

## 📝 License

This project is licensed under the MIT License.
