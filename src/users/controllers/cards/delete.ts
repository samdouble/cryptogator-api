import HttpStatus from 'http-status-codes';
import Card from '../../schemas/Card';
import { ExpressRouteError } from '../../../utils/ExpressRouteError';
import { deletePaymentIntent } from '../../../utils/stripe/paymentIntents';

export default async function (userId, cardId, options: { session?: any } = {}) {
  const card = await Card
    .findOne({
      userId,
      'stripePaymentIntent.id': cardId,
    })
    .session(options.session)
    .exec();
  if (!card) {
    throw new ExpressRouteError(HttpStatus.NOT_FOUND, 'Card does not exist');
  }

  await deletePaymentIntent(cardId);

  return Card
    .deleteOne({
      userId,
      id: cardId,
    })
    .session(options.session)
    .exec()
    .then(() => cardId);
}
