import path from 'node:path';
import url from 'node:url';
import { fileURLToPath } from 'node:url';
import express from 'express';
import pinoHttp from 'pino-http';
import ViteExpress from 'vite-express';
import { routes } from './routes';
import { wss } from './wss';
import { CLIENT_VERSION } from '@/config/client_version';
import { logger } from '@/logger';
import { sessionMiddleware } from '@/server/middleware';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = parseInt(process.env.PORT || '8080', 10);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(ViteExpress.static());

app.use(pinoHttp({ logger }));

// app.use(
//   expressWinston.logger({
//     transports: [new winston.transports.Console()],
//     format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
//     ignoreRoute: (req) => {
//       // うるさいログを除外
//       return /^\/(@|node_modules|src|client|favicon\.ico)/.test(req.path) || req.headers.accept === 'text/x-vite-ping';
//     },
//   }),
// );

app.use(sessionMiddleware);
app.use(routes);

ViteExpress.config({
  viteConfigFile: path.resolve(__dirname, '../../vite.config.js'),
});

const server = ViteExpress.listen(app, PORT, () => {
  logger.info(`Zombals Client version: ${CLIENT_VERSION}`);
  if (process.env.MAINTENANCE_MODE === 'true') {
    logger.warn('Maintenance mode is ON');
  }
  logger.info(`Server running at http://localhost:${PORT}`);
});

server.on('upgrade', (request, socket, head) => {
  const { pathname } = url.parse(request.url!);
  if (pathname === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});
