import HttpStatus from 'http-status-codes';
import fetchEvents from '../controllers/events/fetch';
import passport from '../../passport';
import { executeIfAuthorized } from '../../login/utils';

export default app => {
  app.get(
    '/v1/activities/:activityId/events',
    passport.authenticate(['bearer', 'jwt_general'], { failWithError: true, session: false }),
    async (req, res) => {
      const { activityId } = req.params;
      const { code, response } = await executeIfAuthorized(
        async ({ session }) => ({
          code: HttpStatus.OK,
          response: {
            events: await fetchEvents(req.user.id, activityId, { session }),
          },
        }));
      return res.status(code).send(response);
    },
  );
};
