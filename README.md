# VidsFlow

**Discover. Watch. Flow.**

VidsFlow is a responsive YouTube-powered discovery and viewing platform built with React, Vite, and the official YouTube Data API.

## Live platform

**Production:** https://vidflows.vercel.app

## Highlights

- YouTube-powered discovery and search
- Official YouTube embedded playback
- Floating mini-player
- Shorts discovery
- Channel discovery
- Save and playlist workflows
- Continue-watching progress
- Responsive red / white / black interface
- Server-side YouTube API proxy for the API credential

## Development

```bash
npm ci
npm run dev
```

Build verification:

```bash
npm run build
```

## Deployment

The Vercel project is named **vidflows**. Production deployments use Node.js 24.x.

> The YouTube Data API key must be configured as the server-side `YOUTUBE_API_KEY` environment variable. Never commit the key to the repository.
