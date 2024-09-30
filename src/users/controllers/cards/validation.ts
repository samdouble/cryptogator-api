import Joi from 'joi';

export const schema = {
  cardNumber: Joi.string(),
  cardholderName: Joi.string(),
  expirationDate: Joi.string().regex(/\d{4}\/\d{2}/),
  cvc: Joi.string().regex(/\d{3,4}/),
};

export default schema;
