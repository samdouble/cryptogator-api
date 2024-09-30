import HttpStatus from 'http-status-codes';
import patchUser from '../controllers/patch';
import cardsRoutes from './cards';
import passport from '../../passport';
import { executeIfAuthorized } from '../../login/utils';

export default app => {
  app.patch(
    '/v1/users/me',
    passport.authenticate(['bearer', 'jwt_general'], { failWithError: true, session: false }),
    async (req, res) => {
      const { body } = req;
      const { code, response } = await executeIfAuthorized(
        async ({ session }) => ({
          code: HttpStatus.OK,
          response: {
            user: await patchUser(req.user.id, body, { session }),
          },
        }));
      return res.status(code).send(response);
    },
  );

  cardsRoutes(app);
};
