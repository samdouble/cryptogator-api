import Joi from 'joi';
import HttpStatus from 'http-status-codes';
import { DateTime } from 'luxon';
import validationSchema from './validation';
import Payment from '../schemas/Payment';
import { ExpressRouteError } from '../../utils/ExpressRouteError';

const schema = Joi.object().keys({
  amount: validationSchema.amount.required(),
});

export default async function (userId, paymentInfo, options: { session?: any } = {}) {
  const validation = schema.validate(paymentInfo, { stripUnknown: true });
  if (validation.error) {
    throw new ExpressRouteError(HttpStatus.BAD_REQUEST, 'Invalid request');
  }

  const validatedPayment = validation.value;

  return new Payment({
    ...validatedPayment,
    createdAt: DateTime.now().toUTC().toJSDate(),
    userId,
  })
    .save({ session: options.session })
    .then(async payment => {
      const jsonPayment = payment.getPublicFields();
      return jsonPayment;
    });
}
