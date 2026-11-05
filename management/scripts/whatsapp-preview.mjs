import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { brazilDay, shiftDay } from '../src/whatsappStats.js';

// Dev server only. This never reads production data or bypasses app auth.
export function whatsappPreview() {
  return {
    name: 'whatsapp-local-preview',
    apply: 'serve',
    configureServer(server) {
      const directory = fileURLToPath(new URL('../.cache/', import.meta.url));
      mkdirSync(directory, { recursive: true });
      const database = new DatabaseSync(`${directory}/whatsapp-preview.sqlite`);
      database.exec('create table if not exists clicks (id text primary key, recorded_at text not null); create table if not exists counter (id integer primary key check(id=1), started_at text not null)');
      database.prepare('insert or ignore into counter values(1, ?)').run(new Date().toISOString());
      const insert = database.prepare('insert or ignore into clicks values(?, ?)');
      const analytics = readFileSync(new URL('../../js/analytics.js', import.meta.url), 'utf8');
      server.httpServer?.once('close', () => database.close());
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/__whatsapp/')) return next();
        // Counter preview is only accessible from the developer's loopback server.
        const host = req.headers.host || '';
        const origin = req.headers.origin;
        const loopback = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
        if (!loopback || !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host) || (origin && origin !== `http://${host}`)) {
          res.writeHead(403); res.end(); return;
        }
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('X-Robots-Tag', 'noindex, nofollow');
        const path = req.url.split('?')[0];
        const json = (status, value) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(value)); };
        if (path === '/__whatsapp/report' && req.method === 'GET') {
          const today = brazilDay();
          const counts = new Map();
          for (const row of database.prepare('select recorded_at from clicks where recorded_at >= ?').all(new Date(`${shiftDay(today, -30)}T00:00:00-03:00`).toISOString())) {
            const day = brazilDay(row.recorded_at);
            counts.set(day, (counts.get(day) || 0) + 1);
          }
          json(200, { started_at: database.prepare('select started_at from counter where id=1').get().started_at, updated_at: new Date().toISOString(), days: Array.from({ length: 31 }, (_, index) => { const day = shiftDay(today, index - 30); return { day, clicks: counts.get(day) || 0 }; }) });
        } else if (path === '/__whatsapp/collect' && req.method === 'POST') {
          let raw = '', over = false;
          req.on('data', chunk => { if (over) return; raw += chunk; if (raw.length > 256) { over = true; raw = ''; } });
          req.on('end', () => {
            try {
              const body = JSON.parse(raw);
              if (over || body.consent !== true || Object.keys(body).some(key => !['event_id', 'consent'].includes(key)) || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.event_id || '')) return json(400, { error: 'invalid_click' });
              insert.run(body.event_id, new Date().toISOString());
              json(202, { received: true });
            } catch { json(400, { error: 'invalid_click' }); }
          });
        } else if (path === '/__whatsapp/analytics.js' && req.method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'text/javascript' }); res.end(analytics);
        } else if (path === '/__whatsapp/widget' && req.method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Security-Policy': "default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'self'" });
          res.end(`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><style>body{font:13px system-ui;color:#344334;background:#f2f3ee;margin:0;padding:18px}label{display:flex;align-items:center;gap:8px;margin-bottom:16px}a{display:inline-flex;align-items:center;background:#60745d;color:white;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600}input{accent-color:#60745d}</style><body data-page="home"><label><input id="consent" type="checkbox">Aceito a medição deste teste</label><div data-loaded-partial="floating-widgets"><a href="https://wa.me/5543991043536" data-track="contact" data-contact-method="whatsapp" data-link-location="floating" onclick="event.preventDefault()">Testar clique no WhatsApp ↗</a></div><script>window.FRANCIELE_ANALYTICS_CONFIG={whatsappCounterUrl:'/__whatsapp/collect',pageTypes:{},pageGroups:{},scrollThresholds:[],engagementThresholds:[]};window.SofiatiConsentMode={hasAnalyticsConsent:()=>document.getElementById('consent').checked};</script><script src="/__whatsapp/analytics.js"></script></body></html>`);
        } else json(404, { error: 'not_found' });
      });
    },
  };
}
