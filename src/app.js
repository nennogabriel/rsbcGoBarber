import 'dotenv/config';
import express from 'express';
import * as Sentry from '@sentry/node';
import Youch from 'youch';
import 'express-async-errors';

import path from 'path';
import routes from './routes';
import sentryConfig from './config/sentry';

import './database';

class App {
  constructor() {
    this.server = express();

    Sentry.init(sentryConfig);

    this.server.use(Sentry.Handlers.requestHandler()); // must be the first middleare
    this.middlewares();
    this.routes();
    this.server.use(Sentry.Handlers.errorHandler()); // must be the last middleware
    this.exceptionHandler();
  }

  middlewares() {
    this.server.use(express.json());
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
  }

  exceptionHandler() {
    this.server.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const error = await new Youch(err, req).toJSON();

        return res.status(500).json(error);
      }
      return res.status(500).json({ error: 'Server Internal Error!' });
    });
  }
}

export default new App().server;
