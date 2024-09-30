import Activity from '../schemas/Activity';

export default async function (userId, id, options: { session?: any } = {}) {
  return Activity
    .findOneAndDelete({ userId, id })
    .session(options.session)
    .exec()
    .then(async () => {
      return id;
    });
}
