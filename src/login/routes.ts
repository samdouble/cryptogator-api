import HttpStatus from 'http-status-codes';
import { encrypt } from './utils';
import passport from '../passport';
import createUser from '../users/controllers/create';
import { ExpressRouteError } from '../utils/ExpressRouteError';

const cookieOpts = {
  httpOnly: true,
  domain: (process.env.NODE_ENV === 'production') ? '.fikas.io' : 'localhost',
  path: '/',
  ...(process.env.NODE_ENV === 'production' && {
    secure: true,
  }),
};

export default app => {
  app.post(
    '/v1/login',
    passport.authenticate(['local', 'jwt_login'], { failWithError: true, session: false }),
    async (req, res) => {
      const newToken = encrypt(req.user.id);
      res.cookie('token', newToken, cookieOpts);
      return res
        .status(HttpStatus.OK)
        .send({
          user: req.user,
        });
    },
    async (req, res) => {
      res.clearCookie('token', cookieOpts);
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .send({
          error: 'Not logged in',
        });
    },
  );

  app.get(
    '/v1/auth/google', 
    passport.authenticate('google', { scope : ['profile', 'email'] }),
    async (req, res) => {
      console.log(req.body);
      /*
      const newToken = encrypt(req.user.id);
      res.cookie('token', newToken, cookieOpts);
      */
      return res
        .status(HttpStatus.OK)
        .send({
          user: req.user,
        });
    },
    async (req, res) => {
      res.clearCookie('token', cookieOpts);
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .send({
          error: 'Not logged in',
        });
    },
  );

  app.get(
    '/v1/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    async (req, res) => {
      console.log('CALLBACK', req.body);
      /*
      const newToken = encrypt(req.user.id);
      res.cookie('token', newToken, cookieOpts);
      */
      res.redirect('/');
    },
  );

  app.post(
    '/v1/logout',
    async (req, res) => {
    res.clearCookie('token', cookieOpts);
      return res
        .status(HttpStatus.OK)
        .send({});
    },
  );

  app.post('/v1/signup', async (req, res) => {
    const { body } = req;
    try {
      const user = await createUser(body);
      const newToken = encrypt(user.id);
      res.cookie('token', newToken, cookieOpts);
      return res
        .status(HttpStatus.CREATED)
        .send({
          user,
        });
    } catch (error) {
      res.clearCookie('token', cookieOpts);
      if (error instanceof ExpressRouteError) {
        return res
          .status(error.code)
          .send(error.response);
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(error);
    }
  });
};
