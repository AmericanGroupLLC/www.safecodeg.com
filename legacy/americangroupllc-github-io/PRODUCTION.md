# AmericanGroupLLC.github.io Production Deployment Guide

## Prerequisites
- Node.js v18.x or higher
- API Domain: `api.americangroupllc.github.io.americangroupllc.com` configured with TLS 1.3

## Deployment
```bash
npm install
npm run build
npm run start
```

## Security
- All traffic secured via TLS 1.3 AES-256
- No localhost or local AI dependencies
