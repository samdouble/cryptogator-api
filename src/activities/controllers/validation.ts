import Joi from 'joi';

export const schema = {
  comments: Joi.string().allow(''),
  duration: Joi.number().integer().positive(),
  endTime: Joi.string().isoDate(),
  projects: Joi.array().items(
    Joi.object().keys({
      id: Joi.string(),
    }),
  ),
  startTime: Joi.string().isoDate(),
  tasks: Joi.array().items(
    Joi.object().keys({
      id: Joi.string(),
      duration: Joi.number(),
    }),
  ),
  templateId: Joi.string().allow(null),
  values: Joi.array().items(
    Joi.object().keys({
      fieldId: Joi.string().required(),
      value: Joi.any(),
    }),
  ),
};

export default schema;
