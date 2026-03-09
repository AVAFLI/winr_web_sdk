# WINR Web SDK

A zero-dependency sweepstakes and engagement SDK for web applications. Add daily streaks, rewarded video entries, and sweepstakes campaigns with a few lines of JavaScript.

## Features

- **Daily Streak System** — 3-tier engagement (base entries, weekly bonus, monthly bonus)
- **Rewarded Video** — Pluggable ad provider interface
- **Email Capture** — Built-in age gate (13+) and email validation
- **Server-Driven Config** — Copy, branding, and theme controlled from your dashboard
- **GDPR Compliance** — One-call user data deletion
- **Shadow DOM UI** — Styles won't leak into your page
- **Zero Dependencies** — Works with any framework (React, Vue, Svelte, vanilla JS)
- **Two Bundle Formats** — ESM (import) + UMD (script tag)

## Installation

### npm / yarn

```bash
npm install winr-web-sdk
```

### CDN (script tag)

```html
<script src="https://unpkg.com/winr-web-sdk/dist/winr-sdk.umd.js"></script>
```

## Quick Start

### ESM (import)

```javascript
import WINR from 'winr-web-sdk';

// 1. Configure
await WINR.configure({
  apiKey: 'your-api-key',
  environment: 'production',
});

// 2. Set user
WINR.setUser({ id: 'user-123' });

// 3. Show experience
WINR.present();
```

### UMD (script tag)

```html
<script src="https://unpkg.com/winr-web-sdk/dist/winr-sdk.umd.js"></script>
<script>
  WINR.default.configure({ apiKey: 'your-api-key' })
    .then(() => {
      WINR.default.setUser({ id: 'user-123' });
      WINR.default.present();
    });
</script>
```

### Inline (embed in a container)

```javascript
WINR.presentInline('winr-container');
```

## Custom Branding

```javascript
await WINR.configure({
  apiKey: 'your-api-key',
  branding: {
    primaryColor: '#6C63FF',
    backgroundColor: '#020617',
    logoUrl: 'https://your-app.com/logo.png',
    appName: 'Your App',
  },
});
```

## Rewarded Video

```javascript
WINR.setRewardedVideoProvider({
  isAdAvailable: async () => true,
  loadAd: async () => {},
  showAd: async () => true, // return true if user earned reward
});
```

## GDPR

```javascript
await WINR.deleteUserData();
```

## API Reference

| Method | Description |
|--------|-------------|
| `WINR.configure(options)` | Initialize the SDK |
| `WINR.setUser(user)` | Set the current user |
| `WINR.present()` | Show modal experience |
| `WINR.presentInline(containerId)` | Embed in a DOM element |
| `WINR.dismiss()` | Close the modal |
| `WINR.deleteUserData()` | GDPR data deletion |

## Requirements

- Modern browser (Chrome 80+, Firefox 78+, Safari 14+, Edge 80+)
- No framework required

## License

MIT — see [LICENSE](LICENSE) for details.
