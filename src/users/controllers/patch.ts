import Joi from 'joi';
import HttpStatus from 'http-status-codes';
import { DateTime } from 'luxon';
import validationSchema from './validation';
import User from '../schemas/User';
import { ExpressRouteError } from '../../utils/ExpressRouteError';
import { updateCustomer } from '../../utils/stripe/customers';

const schema = Joi.object().keys({
  censoredWords: validationSchema.censoredWords,
  emailAddress: validationSchema.emailAddress,
  language: validationSchema.language,
  name: validationSchema.name,
  // password: validationSchema.password,
});

export default async function (userId, userInfo, options: { session?: any } = {}) {
  const validation = schema.validate(userInfo, { stripUnknown: true });
  if (validation.error) {
    throw new ExpressRouteError(HttpStatus.BAD_REQUEST, 'Invalid form data');
  }

  const validatedUser = validation.value;

  if (validatedUser.emailAddress) {
    const existingUser = await User
      .findOne({
        id: { $ne: userId },
        emailAddress: validatedUser.emailAddress,
      })
      .session(options.session)
      .exec();
    if (existingUser) {
      throw new ExpressRouteError(HttpStatus.CONFLICT, 'This email address is already used');
    }
  }

  const user = await User
    .findOne({
      id: userId,
    })
    .session(options.session)
    .exec();
  if (!user) {
    throw new ExpressRouteError(HttpStatus.NOT_FOUND, 'The user does not exist');
  }
  const jsonUser = user.toJSON();

  let stripeCustomer: any = undefined;
  if (
    Object.keys(validatedUser).includes('emailAddress')
    || Object.keys(validatedUser).includes('name')
  ) {
    stripeCustomer = await updateCustomer(
      jsonUser.stripeCustomer.id,
      {
        email: validatedUser.emailAddress || user.emailAddress,
        name: validatedUser.name || user.name,
      },
    );
  }
  return user
    .set({
      ...validatedUser,
      modifiedAt: DateTime.now().toUTC().toJSDate(),
      ...(stripeCustomer ? { stripeCustomer } : {}),
    })
    .save({ session: options.session })
    .then(async u => u.json());
}
