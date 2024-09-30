import HttpStatus from 'http-status-codes';
import eventsRoutes from './events';
import fetchActivities from '../controllers/fetch';
import fetchOneActivity from '../controllers/fetchOne';
import createActivity from '../controllers/create';
import updateActivity from '../controllers/update';
import patchActivity from '../controllers/patch';
import deleteActivity from '../controllers/delete';
import passport from '../../passport';
import { executeIfAuthorized } from '../../login/utils';

export default app => {
  app.get(
    '/v1/activities',
    passport.authenticate(['bearer', 'jwt_general'], { failWithError: true, session: false }),
    async (req, res) => {
      const { query } = req;
      const { code, response } = await executeIfAuthorized(
        async ({ session }) => ({
          code: HttpStatus.OK,
          response: {
            activities: await fetchActivities(req.user.id, query, { session }),
          },
        }));
      return res.status(code).send(response);
    },
  );

  app.get(
    '/v1/activities/:id',
    passport.authenticate(['bearer', 'jwt_general'], { failWithError: true, session: false }),
    async (req, res) => {
      const { id } = req.params;
      const { code, response } = await executeIfAuthorized(
        async ({ session }) => ({
          code: HttpStatus.OK,
          response: {
            activity: await fetchOneActivity(req.user.id, id, { session }),
          },
        }));
    return res.status(code).send(response);
  });

  app.post(
    '/v1/activities',
    passport.authenticate(['bearer', 'jwt_general'], { failWithError: true, session: false }),
    async (req, res) => {
      const { body } = req;
      const { code, response } = await executeIfAuthorized(
        async ({ session }) => ({
          code: HttpStatus.CREATED,
          response: {
            activity: await createActivity(req.user.id, body, { session }),
          },
        }));
      return res.status(code).send(response);
    },
  );

  app.put(
    '/v1/activities/:id',
    passport.authenticate(['bearer', 'jwt_general'], { failWithError: true, session: false }),
    async (req, res) => {
      const { body, params } = req;
      const { id } = params;
      const { code, response } = await executeIfAuthorized(
        async ({ session }) => ({
          code: HttpStatus.OK,
          response: {
            activity: await updateActivity(req.user.id, id, body, { session }),
          },
        }));
      return res.status(code).send(response);
    },
  );

  app.patch(
    '/v1/activities/:id',
    passport.authenticate(['bearer', 'jwt_general'], { failWithError: true, session: false }),
    async (req, res) => {
      const { body, params } = req;
      const { id } = params;
      const { code, response } = await executeIfAuthorized(
        async ({ session }) => ({
          code: HttpStatus.OK,
          response: {
            activity: await patchActivity(req.user.id, id, body, { session }),
          },
        }));
      return res.status(code).send(response);
    },
  );

  app.delete(
    '/v1/activities/:id',
    passport.authenticate(['bearer', 'jwt_general'], { failWithError: true, session: false }),
    async (req, res) => {
      const { params } = req;
      const { id } = params;
      const { code, response } = await executeIfAuthorized(
        async ({ session }) => ({
          code: HttpStatus.OK,
          response: {
            activityId: await deleteActivity(req.user.id, id, { session }),
          },
        }));
      return res.status(code).send(response);
    },
  );

  eventsRoutes(app);
};
