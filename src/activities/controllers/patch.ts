import Joi from 'joi';
import HttpStatus from 'http-status-codes';
import { DateTime } from 'luxon';
import { diff, detailedDiff } from 'deep-object-diff';
import Activity from '../schemas/Activity';
import { IActivityField } from '../schemas/Activity';
import validationSchema from './validation';
import { ExpressRouteError } from '../../utils/ExpressRouteError';

const schema = Joi.object().keys({
  comments: validationSchema.comments,
  duration: validationSchema.duration,
  endTime: validationSchema.endTime,
  projects: validationSchema.projects,
  startTime: validationSchema.startTime,
  tasks: validationSchema.tasks,
  templateId: validationSchema.templateId,
  values: validationSchema.values,
});

export default async function (userId, id, activityInfo, options: { session?: any } = {}) {
  const validation = schema.validate(activityInfo, { stripUnknown: true });
  if (validation.error) {
    throw new ExpressRouteError(HttpStatus.BAD_REQUEST, 'Invalid form data');
  }
  const validatedActivity = validation.value;

  const activityDocument = await Activity
    .findOne({ userId, id })
    .session(options.session)
    .exec();
  if (!activityDocument) {
    throw new ExpressRouteError(HttpStatus.NOT_FOUND, 'Activity not found');
  }

  const newValues: IActivityField[] = [];

  return activityDocument
    .set({
      ...validatedActivity,
      values: newValues,
      modifiedAt: DateTime.now().toUTC().toJSDate(),
    })
    .save({ session: options.session })
    .then(async activity => {
      const jsonActivity = activity.getPublicFields();
      return jsonActivity;
    });
}
