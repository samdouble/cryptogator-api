import Activity from '../schemas/Activity';
import createEvent from '../../events/controllers/create';

export default async function (userId, id, options: { session?: any } = {}) {
  return Activity
    .findOneAndDelete({ userId, id })
    .session(options.session)
    .exec()
    .then(async () => {
      await createEvent(userId, {
        type: 'ACTIVITY',
        eventType: 'DELETED',
        activityId: id,
      }, options);
      return id;
    });
}
