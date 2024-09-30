import Joi from 'joi';
import HttpStatus from 'http-status-codes';
import { DateTime } from 'luxon';
import validationSchema from './validation';
import Activity from '../schemas/Activity';
import { IActivityField } from '../schemas/Activity';
import { ExpressRouteError } from '../../utils/ExpressRouteError';
import { emitToAll } from '../../utils/socket';

const schema = Joi.object().keys({
  comments: validationSchema.comments,
  duration: validationSchema.duration,
  endTime: validationSchema.endTime,
  projects: validationSchema.projects.default([]),
  startTime: validationSchema.startTime,
  tasks: validationSchema.tasks.default([]),
  templateId: validationSchema.templateId,
  values: validationSchema.values.default([]),
});

export default async (userId, activityInfo, options: { session?: any } = {}) => {
  const validation = schema.validate(activityInfo, { stripUnknown: true });
  if (validation.error) {
    throw new ExpressRouteError(HttpStatus.BAD_REQUEST, 'Invalid form data');
  }
  const validatedActivity = validation.value;

  const newValues: IActivityField[] = [];

  return new Activity({
      ...validatedActivity,
      values: newValues,
      createdAt: DateTime.now().toUTC().toJSDate(),
      modifiedAt: DateTime.now().toUTC().toJSDate(),
      userId,
    })
    .save({ session: options.session })
    .then(async activity => {
      const jsonActivity = activity.getPublicFields();
      // TODO only broadcast to User who made the request
      emitToAll({
        type: 'ACTIVITY',
        eventType: 'CREATED',
        activity: jsonActivity,
      });
      return jsonActivity;
    });
};
