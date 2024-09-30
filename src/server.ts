import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http';
import helmet from 'helmet';
import rateLimit from "express-rate-limit";
import mongoConnect from './db';
import passport from './passport';
import routes from './routes';
import { initIoSocket } from './utils/socket';

const DEFAULT_HTTP_PORT = 8000;

// Limit to 1000 API calls / 10 minutes
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
	legacyHeaders: false,
  // TODO store: use a redis store
});

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
  allowedHeaders: [
    'Accept',
    'Content-Type',
    'Origin',
    'X-Access-Token',
    'X-Requested-With',
  ],
  credentials: true,
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
  origin: (process.env.NODE_ENV === 'production')
    ? [/cryptogator\.com/, /\.cryptogator\.com$/]
    : [/localhost/],
  preflightContinue: false,
}));
app.use(helmet());
app.use(limiter);
app.use(passport.initialize());
app.set('trust proxy', true);
app.set('trust proxy', 'loopback');

const port = process.env.HTTP_PORT || DEFAULT_HTTP_PORT;
const server = http.createServer(app);

server.listen({ port }, () => {
  console.log(`Server listening on port ${port}`);
  mongoConnect(process.env.MONGO_URL);
  initIoSocket(server);
  routes(app);
});
