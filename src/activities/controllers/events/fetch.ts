import Event from '../../../events/schemas/Event';

export default async (userId, activityId, options: { session?: any } = {}) => {
  return Event
    .find({
      userId,
      type: 'ACTIVITY',
      activityId,
    })
    .session(options.session)
    .exec()
    .then(events => events.map(event => event.getPublicFields()));
};
