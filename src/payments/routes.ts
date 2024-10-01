import HttpStatus from 'http-status-codes';
import fetchPayments from './controllers/fetch';
import createPayment from './controllers/create';
import passport from '../passport';
import { executeIfAuthorized } from '../login/utils';

export default app => {
  app.get(
    '/v1/payments',
    passport.authenticate(['bearer', 'jwt_general'], { failWithError: true, session: false }),
    async (req, res) => {
      const { code, response } = await executeIfAuthorized(
        async ({ session }) => ({
          code: HttpStatus.OK,
          response: {
            payments: await fetchPayments(req.user.id, { session }),
          },
        }));
      return res.status(code).send(response);
    },
  );

  app.post(
    '/v1/payments',
    passport.authenticate(['bearer', 'jwt_general'], { failWithError: true, session: false }),
    async (req, res) => {
      const { body } = req;
      const { code, response } = await executeIfAuthorized(
        async ({ session }) => ({
          code: HttpStatus.CREATED,
          response: {
            payment: await createPayment(req.user.id, body, { session }),
          },
        }));
      return res.status(code).send(response);
    },
  );
};
