# IPTV Player 🎥 - Watch LiveTV Anywhere!

IPTV Player is a modern, feature-rich web application for streaming live TV, allowing users to load playlists, switch channels, and enjoy seamless playback of IPTV streams. It is powered by Bugsfree studio and designed to provide a dynamic, customizable experience with themes and smart control features.

## Features 📋

- **Stream Playback**: Supports `.m3u`, `.m3u8`, and `.mpd` formats.
- **Dynamic Themes**: Select from light, dark, ocean-blue, emerald-green, and slate-gray themes.
- **Favorites and History**: Easily save favorite channels and access playlist history.
- **Streaming Controls**:
  - Picture-in-Picture mode.
  - Fullscreen toggle.
  - Sleep timer for automatic shutdown.
- **Custom Playlists**: Upload or load playlists via URL.
- **Search and Filter**: Search for specific channels or filter by categories.
- **EPG (Electronic Program Guide)**: View and navigate through program schedules (if available).
- **Responsive Design**: Optimized for both desktop and mobile devices with gesture support.

## Getting Started 🚀

Follow these steps to get the IPTV Player up and running on your local machine.

### Prerequisites

To use this player, you need:
- A modern web browser (e.g., Chrome, Firefox, Edge).
- An available playlist in `.m3u`, `.m3u8`, or `.mpd` format.
- An internet connection for live streaming.

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/bugsfreeweb/iptv.git
   ```
2. Open the `index.html` file in your browser:
   ```bash
   open index.html
   ```

### Usage

1. Load a playlist:
   - Enter the playlist URL in the provided input field, or
   - Upload a local playlist file (`.m3u`, `.json`, `.txt`).
2. Start streaming by selecting a channel from the list.
3. Customize your experience:
   - Change themes by cycling through options with the "Cycle Theme" button.
   - Add channels to your favorites for quick access.
   - Use the EPG to view schedules (if supported by the channel).

## Technical Details 🛠️

### Technologies Used

- **HTML5 Video**: Core video rendering.
- **HLS.js**: HLS stream support.
- **Dash.js**: MPEG-DASH stream support.
- **CryptoJS**: Encryption for secure URL handling.
- **QR Code.js**: Generate QR codes for playlist sharing (Under Construction)

### Key Components

1. **Dynamic Themes**:
   - Themes are defined using CSS Variables (`:root` selectors).
   - Includes light, dark, and custom themes like ocean-blue and emerald-green.

2. **Streaming Features**:
   - Auto-detects stream formats (HLS, DASH).
   - Provides quality selection for adaptive streaming.

3. **Playback Controls**:
   - Fullscreen, Picture-in-Picture, and sleep-timer functionality.
   - Keyboard shortcuts for fast navigation.

4. **EPG Integration**:
   - Parses XML data for electronic program guides.
   - Displays schedule information when available.

5. **Mobile-Friendly Design**:
   - Gesture-based controls for channel switching.
   - Optimized layouts for both portrait and landscape modes.

## How It Works 🔧

1. **Stream Health Check**:
   - Validates stream accessibility using temporary video elements.
   - Supports CORS and HTTP error handling for fallback streams.

2. **Playlist Parsing**:
   - Parses `.m3u`, `.json`, and `.txt` files for channel data.
   - Extracts metadata such as channel name, logo, category, and EPG URL.

3. **Favorites and History**:
   - Stores user preferences in `localStorage`.
   - Allows users to revisit previously loaded playlists.

4. **Dynamic Quality Selector**:
   - Populated based on available quality levels in HLS or DASH streams.

## Keyboard Shortcuts ⌨️

| Shortcut            | Action                     |
|---------------------|----------------------------|
| `Ctrl + B`          | Toggle sidebar            |
| `Ctrl + F`          | Toggle favorites          |
| `Ctrl + T`          | Cycle through themes      |
| `Ctrl + L`          | Focus on playlist URL     |
| `Ctrl + S`          | Focus on search bar       |
| `Ctrl + Arrow Left` | Previous channel          |
| `Ctrl + Arrow Right`| Next channel              |
| `Escape`            | Close sidebar or popup    |

## Roadmap 🗺️

- [ ] Add DRM support for protected streams.
- [ ] Enhance EPG integration with channel logos and thumbnails.
- [ ] Add multi-language support for UI.
- [ ] Implement a server-side backend for playlist management.

## Contributing 🤝

Contributions are welcome! To contribute:
1. Fork the repository.
2. Create your feature branch: `git checkout -b feature-name`.
3. Commit your changes: `git commit -m 'Add feature-name'`.
4. Push to the branch: `git push origin feature-name`.
5. Open a pull request.

## License 📝

This project is licensed under the MIT License. See `LICENSE` for details.

## Acknowledgments 🙏

- [HLS.js](https://github.com/video-dev/hls.js)
- [Dash.js](https://github.com/Dash-Industry-Forum/dash.js)
- [QR Code.js](https://github.com/davidshimjs/qrcodejs)
- [CryptoJS](https://github.com/brix/crypto-js)
- Inspiration from the open-source IPTV community.

## Disclaimer ⚠️

This player is intended for personal use only. The developer is not responsible for any misuse or copyright infringement caused by illegal playlist usage.

---

Built with ❤️ by [Bugsfree](https://github.com/bugsfreeweb)
