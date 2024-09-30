import HttpStatus from 'http-status-codes';
import fetchCards from '../controllers/cards/fetch';
import createCard from '../controllers/cards/create';
import deleteCard from '../controllers/cards/delete';
import passport from '../../passport';
import { executeIfAuthorized } from '../../login/utils';

export default app => {
  app.get(
    '/v1/users/me/cards',
    passport.authenticate(['bearer', 'jwt_general'], { failWithError: true, session: false }),
    async (req, res) => {
      const { code, response } = await executeIfAuthorized(
        async ({ session }) => ({
          code: HttpStatus.OK,
          response: {
            cards: await fetchCards(req.user.id, { session }),
          },
        }));
      return res.status(code).send(response);
    },
  );

  app.post(
    '/v1/users/me/cards',
    passport.authenticate(['bearer', 'jwt_general'], { failWithError: true, session: false }),
    async (req, res) => {
      const { body } = req;
      const { code, response } = await executeIfAuthorized(
        async ({ session }) => ({
          code: HttpStatus.CREATED,
          response: {
            card: await createCard(req.user.id, body, { session }),
          },
        }));
      return res.status(code).send(response);
    },
  );

  app.delete(
    '/v1/users/me/cards/:id',
    passport.authenticate(['bearer', 'jwt_general'], { failWithError: true, session: false }),
    async (req, res) => {
      const { params } = req;
      const { id } = params;
      const { code, response } = await executeIfAuthorized(
        async ({ session }) => ({
          code: HttpStatus.OK,
          response: {
            cardId: await deleteCard(req.user.id, id, { session }),
          },
        }));
      return res.status(code).send(response);
    },
  );
};
