import HttpStatus from 'http-status-codes';
import Joi from 'joi';
import { DateTime } from 'luxon';
import regexEscape from 'regex-escape';
import Activity from '../schemas/Activity';
import { ExpressRouteError } from '../../utils/ExpressRouteError';

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

export default async (userId, pQuery, options: { session?: any } = {}) => {
  let validation;
  try {
    const jsonQuery = (typeof pQuery === 'string') ? JSON.parse(pQuery) : pQuery;
    const jsonFilter = jsonQuery.filter && JSON.parse(jsonQuery.filter);
    const jsonSort = jsonQuery.sort && JSON.parse(jsonQuery.sort);
    const { q } = jsonQuery;
    validation = schema.validate({
      filter: jsonFilter,
      sort: jsonSort,
      q,
    }, { stripUnknown: true });
  } catch (error) {
    throw new ExpressRouteError(HttpStatus.BAD_REQUEST, 'Invalid request');
  }
  if (validation.error) {
    throw new ExpressRouteError(HttpStatus.BAD_REQUEST, 'Invalid request');
  }
  const query = validation.value;
  const filter = query && query.filter;
  const sort = query && query.sort;
  const startTime = filter && filter.startTime;
  const endTime = filter && filter.endTime;
  const search = query && query.q;
  return Activity
    .find({
      userId,
      ...(endTime && { startTime: { $lte: DateTime.fromISO(endTime).toUTC().toJSDate() } }),
      ...(startTime && { endTime: { $gte: DateTime.fromISO(startTime).toUTC().toJSDate() } }),
      ...(search && { comments: { $regex: regexEscape(search) , $options: 'i' } }),
    })
    .sort({
      ...sort,
    })
    .session(options.session)
    .exec()
    .then(activities => activities.map(activity => activity.getPublicFields()));
};
