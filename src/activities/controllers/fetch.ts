import Joi from 'joi';
import Activity from '../schemas/Activity';

const filterSchema = Joi.object().keys({
  startTime: Joi.string().isoDate(),
  endTime: Joi.string().isoDate(),
});

const sortSchema = Joi.object().keys({
  startTime: Joi.number().valid(-1, 1),
  endTime: Joi.number().valid(-1, 1),
});

const schema = Joi.object().keys({
  filter: filterSchema.optional(),
  sort: sortSchema.optional(),
  q: Joi.string(),
});

export default async (userId, options: { session?: any } = {}) => {
  return Activity
    .find({
      userId,
    })
    .session(options.session)
    .exec()
    .then(activities => activities.map(activity => activity.getPublicFields()));
};
