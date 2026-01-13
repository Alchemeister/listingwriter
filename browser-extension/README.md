# ListingWriter Browser Extension

AI-powered marketplace listing generator. Upload photos, get optimized descriptions instantly, and auto-fill marketplace forms.

## Features

- Upload up to 3 photos of your item
- Generate 3 listing descriptions (Casual, Professional, Punchy)
- One-click copy to clipboard
- Auto-fill marketplace description fields
- Dark/Light theme support
- Saves form data for convenience

## Supported Marketplaces

- Craigslist
- Facebook Marketplace
- OfferUp
- Mercari
- Poshmark
- eBay

## Installation

### Development (Unpacked Extension)

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select this `browser-extension` folder
5. The extension icon should appear in your toolbar

### Icon Setup

Before loading the extension, you need to generate the icon PNG files:

1. Open `icons/icon.svg` in a browser
2. Use a tool like [CloudConvert](https://cloudconvert.com/svg-to-png) to create:
   - `icon16.png` (16x16)
   - `icon48.png` (48x48)
   - `icon128.png` (128x128)
3. Save them in the `icons/` folder

Or create simple colored squares with "L" in any image editor.

## Configuration

### API Endpoint

Edit `popup.js` line 3 to point to your ListingWriter API:

```javascript
const API_URL = 'http://localhost:8081/api/generate'; // Development
// const API_URL = 'https://your-domain.com/api/generate'; // Production
```

## Usage

1. Click the ListingWriter icon in your browser toolbar
2. Upload 1-3 photos of your item
3. Fill in the item details (name, price, condition, category)
4. Click "Generate Listings"
5. Choose your favorite tone:
   - **Casual** - Friendly and approachable
   - **Professional** - Polished and detailed
   - **Punchy** - Short and direct
6. Click "Copy" to copy to clipboard, or
7. Click "Auto-fill" to automatically fill the description field on marketplace pages

## Development

### File Structure

```
browser-extension/
├── manifest.json      # Extension configuration
├── popup.html         # Extension popup UI
├── popup.css          # Popup styles
├── popup.js           # Popup logic
├── content.js         # Content script for auto-fill
├── content.css        # Content script styles
├── background.js      # Service worker
├── icons/             # Extension icons
│   ├── icon.svg       # Source SVG
│   ├── icon16.png     # 16x16 icon
│   ├── icon48.png     # 48x48 icon
│   └── icon128.png    # 128x128 icon
└── README.md          # This file
```

### Testing

1. Load the unpacked extension
2. Make sure your ListingWriter API is running
3. Click the extension icon
4. Try uploading images and generating listings
5. Visit a supported marketplace and test auto-fill

## Privacy

- Images are only sent to the ListingWriter API for processing
- No images are stored after processing
- Form data is stored locally in browser storage
- No analytics or tracking (unless you add it)

## License

MIT
