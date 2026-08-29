/* eslint-disable no-undef */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const express = require('express');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const http = require('http');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

/**
 * Local demo front door.
 *
 * Stands in for the nginx container in a real deployment: serves the built
 * frontend and proxies /api/* to the backend, so both are on one origin. That
 * matters beyond convenience — the frontend falls back to
 * window.location.origin for its API base when VITE_API_URL is unset, which is
 * how the production image is built. Same-origin here means the demo exercises
 * the same code path, and no CORS configuration is involved.
 *
 * DEMO ONLY. Binds to loopback and has no authentication, exactly like the
 * app behind it. Do not put this on a public interface.
 */

const PORT = Number(process.env.DEMO_PORT || 3401);
const BACKEND_PORT = Number(process.env.DEMO_BACKEND_PORT || 3400);
const DIST = path.resolve(__dirname, '..', 'dist-fe');

const app = express();

// Proxy first, so /api never falls through to the SPA handler.
app.use('/api', (req, res) => {
  const upstream = http.request(
    {
      host: '127.0.0.1',
      port: BACKEND_PORT,
      // req.url is already stripped of the /api mount point by express.
      path: '/api' + req.url,
      method: req.method,
      headers: { ...req.headers, host: `127.0.0.1:${BACKEND_PORT}` }
    },
    upstreamRes => {
      res.writeHead(upstreamRes.statusCode || 502, upstreamRes.headers);
      upstreamRes.pipe(res);
    }
  );

  upstream.on('error', err => {
    if (!res.headersSent) res.status(502).json({ success: false, message: `backend unreachable: ${err.message}` });
    else res.destroy();
  });

  // Stream rather than buffer: logos and signatures are posted as base64
  // inside JSON and the backend accepts up to 50mb.
  req.pipe(upstream);
});

app.use(express.static(DIST));

// SPA fallback for client-side routes.
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(DIST, 'index.html'));
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Demo front door on http://127.0.0.1:${PORT} (api -> 127.0.0.1:${BACKEND_PORT})`);
});
