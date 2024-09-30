import Joi from 'joi';
import HttpStatus from 'http-status-codes';
import { DateTime } from 'luxon';
import Card from '../../schemas/Card';
import User from '../../../users/schemas/User';
import { ExpressRouteError } from '../../../utils/ExpressRouteError';
import { createCustomer } from '../../../utils/stripe/customers';
import { createPaymentIntent } from '../../../utils/stripe/paymentIntents';

const schema = Joi.object().keys({
});

export default async (userId, cardInfos, options: { session?: any } = {}) => {
  const validation = schema.validate(cardInfos, { stripUnknown: true });
  if (validation.error) {
    throw new ExpressRouteError(HttpStatus.BAD_REQUEST, 'Invalid form data');
  }
  const validatedCard = validation.value;

  const user = await User
    .findOne({
      id: userId,
    })
    .session(options.session)
    .exec();
  if (!user) {
    throw new ExpressRouteError(HttpStatus.NOT_FOUND, 'The user does not exist');
  }

  let stripeCustomerId;
  const jsonUser = user.toJSON();
  if (jsonUser.stripeCustomer) {
    stripeCustomerId = jsonUser.stripeCustomer.id;
  } else {
    const stripeCustomer = await createCustomer({
      email: jsonUser.emailAddress,
      name: jsonUser.name,
    });
    await user
      .set({
        modifiedAt: DateTime.now().toUTC().toJSDate(),
        stripeCustomer,
      })
      .save({ session: options.session });
    stripeCustomerId = stripeCustomer.id;
  }

  const paymentIntent = await createPaymentIntent(stripeCustomerId);

  return new Card({
      createdAt: DateTime.now().toUTC().toJSDate(),
      modifiedAt: DateTime.now().toUTC().toJSDate(),
      stripePaymentIntent: paymentIntent,
      userId,
    })
    .save({ session: options.session })
    .then(card => card.getPublicFields());
};
