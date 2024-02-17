import path from 'node:path';
import url from 'node:url';
import { fileURLToPath } from 'node:url';
import express from 'express';
import expressWinston from 'express-winston';
import ViteExpress from 'vite-express';
import winston from 'winston';
import { routes } from './routes';
import { wss } from './wss';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = parseInt(process.env.PORT || '8080', 10);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(ViteExpress.static());

app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    ignoreRoute: (req) => {
      // うるさいログを除外
      return /^\/(@|node_modules|src|client|favicon\.ico)/.test(req.path) || req.headers.accept === 'text/x-vite-ping';
    },
  }),
);

app.use(routes);

ViteExpress.config({
  viteConfigFile: path.resolve(__dirname, '../../vite.config.js'),
});

const server = ViteExpress.listen(app, PORT, () => {
  console.log(`\n\nServer running at http://localhost:${PORT}\n\n`);
});

server.on('upgrade', (request, socket, head) => {
  const { pathname } = url.parse(request.url!);
  if (pathname === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});
