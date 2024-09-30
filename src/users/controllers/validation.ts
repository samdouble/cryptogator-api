import Joi from 'joi';

export const schema = {
  censoredWords: Joi.array().items(
    Joi.string(),
  ),
  emailAddress: Joi.string().email(),
  language: Joi.string().valid('en', 'fr'),
  name: Joi.string(),
  password: Joi.string().min(6),
};

export default schema;
