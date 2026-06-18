# MiniNAS WeChat Mini Program

Phone-side mini program for MiniNAS.

## Current MVP Status

This first slice provides a device connection page:

- Enter the desktop agent address.
- Normalize `host:port` into `http://host:port`.
- Call `GET /health`.
- Show online/offline status.
- Show the desktop data directory returned by the agent.

## Open In WeChat DevTools

Open this folder:

```text
E:\MiniNAS\app
```

The project currently uses tourist mode:

```json
"appid": "touristappid"
```

Replace it with the real mini program AppID before preview/upload.

## Development

```powershell
npm install
npm test
```

For LAN testing in development, WeChat DevTools must allow local network requests. The MVP uses `urlCheck: false` in local project settings.

