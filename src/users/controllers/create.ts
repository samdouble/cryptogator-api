import Joi from 'joi';
import HttpStatus from 'http-status-codes';
import { DateTime } from 'luxon';
import bcrypt from 'bcrypt';
import validationSchema from './validation';
import User from '../schemas/User';
import { ExpressRouteError } from '../../utils/ExpressRouteError';
import { createCustomer } from '../../utils/stripe/customers';

const schema = Joi.object().keys({
  censoredWords: validationSchema.censoredWords,
  emailAddress: validationSchema.emailAddress.required(),
  language: validationSchema.language,
  name: validationSchema.name.required(),
  password: validationSchema.password.required(),
});

export default async userInfo => {
  const validation = schema.validate(userInfo, { stripUnknown: true });
  if (validation.error) {
    throw new ExpressRouteError(HttpStatus.BAD_REQUEST, 'Invalid form data');
  }
  const validatedUser = validation.value;

  const existingUser = await User
    .findOne({ emailAddress: validatedUser.emailAddress })
    .exec();
  if (existingUser) {
    throw new ExpressRouteError(HttpStatus.CONFLICT, 'This email address is already used');
  }

  const password = bcrypt.hashSync(validatedUser.password, 10);

  const stripeCustomer = await createCustomer({
    email: validatedUser.emailAddress,
    name: validatedUser.name,
  });
  return new User({
      ...validatedUser,
      createdAt: DateTime.now().toUTC().toJSDate(),
      modifiedAt: DateTime.now().toUTC().toJSDate(),
      password,
      stripeCustomer,
    })
    .save()
    .then(user => {
      /*
      sendmail({
        from: 'no-reply@fikas.io',
        to: validatedUser.emailAddress,
        subject: 'Welcome to fikas.io',
        html: `Bonjour ${validatedUser.name}`,
      }, (err, reply) => {
        // TODO gérer erreur
        console.log('error', err);
      });
      */
      return user.json();
    });
};
