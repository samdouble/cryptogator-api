import Joi from 'joi';
import HttpStatus from 'http-status-codes';
import { DateTime } from 'luxon';
import { diff, detailedDiff } from 'deep-object-diff';
import Activity from '../schemas/Activity';
import { IActivityField } from '../schemas/Activity';
import createEvent from '../../events/controllers/create';
import fetchOneTemplate from '../../templates/controllers/fetchOne';
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

  const jsonOldActivity = activityDocument.getPublicFields();

  const newValues: IActivityField[] = [];
  if (validatedActivity.templateId) {
    await fetchOneTemplate(userId, validatedActivity.templateId, options)
      .then(template => {
        validatedActivity.values.forEach(value => {
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

  return activityDocument
    .set({
      ...validatedActivity,
      values: newValues,
      modifiedAt: DateTime.now().toUTC().toJSDate(),
    })
    .save({ session: options.session })
    .then(async activity => {
      const jsonActivity = activity.getPublicFields();
      await createEvent(userId, {
        type: 'ACTIVITY',
        eventType: 'UPDATED',
        activityId: jsonActivity.id,
        activity: jsonActivity,
        oldActivity: jsonOldActivity,
        diff: diff(jsonOldActivity, jsonActivity),
        detailedDiff: detailedDiff(jsonOldActivity, jsonActivity),
      }, options);
      return jsonActivity;
    });
}
