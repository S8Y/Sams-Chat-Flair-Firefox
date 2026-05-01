# Sam's Chat Flair (Firefox)

Firefox conversion of [Sam's Chat Flair](https://github.com/ABJBMBACHGAPPGKHOMGFNCLCIJHHGLCK) Chrome extension.

Displays custom emojis and leaderboard flair in Sam's Kick chat.

## Installation

1. Open Firefox and go to `about:debugging`
2. Click **This Firefox** → **Load Temporary Add-on**
3. Select `manifest.json` from the `firefox` folder

Or load `SamChatFlair-Firefox.zip` via Drag & Drop into `about:addons`.

## Differences from Chrome

- Uses `browser.*` API instead of `chrome.*`
- MV3 background script (non-persistent)
- Added `browser_specific_settings` for Firefox
- Minimum version: Firefox 128.0+

## Building

The original Chrome extension was converted using `chrome-to-firefox` patterns - no code logic changes beyond API compatibility.

## License

MIT