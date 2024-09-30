import Joi from 'joi';
import HttpStatus from 'http-status-codes';
import { DateTime } from 'luxon';
import validationSchema from './validation';
import Activity from '../schemas/Activity';
import { IActivityField } from '../schemas/Activity';
import createEvent from '../../events/controllers/create';
import fetchOneTemplate from '../../templates/controllers/fetchOne';
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
  if (validatedActivity.templateId) {
    await fetchOneTemplate(userId, validatedActivity.templateId, options)
      .then(template => {
        validatedActivity.values
          .forEach(value => {
            const field = template.fields?.find(f => f.id === value.fieldId);
            if (field) {
              newValues.push({
                ...value,
                fieldName: field.name,
              });
            }
          });
      })
      .catch(error => { throw error; })
  }

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
      await createEvent(userId, {
        type: 'ACTIVITY',
        eventType: 'CREATED',
        activityId: jsonActivity.id,
        activity: jsonActivity,
      }, options);
      return jsonActivity;
    });
};
