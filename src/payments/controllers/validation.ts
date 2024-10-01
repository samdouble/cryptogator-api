import Joi from 'joi';

export default {
  amount: Joi.number().positive(),
};
