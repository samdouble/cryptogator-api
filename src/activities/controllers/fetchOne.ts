import HttpStatus from 'http-status-codes';
import Activity from '../schemas/Activity';
import { ExpressRouteError } from '../../utils/ExpressRouteError';

export default async (userId, id, options: { session?: any } = {}) => {
  return Activity
    .findOne({
      userId,
      id,
    })
    .session(options.session)
    .exec()
    .then(activity => {
      if (!activity) {
        throw new ExpressRouteError(HttpStatus.NOT_FOUND, 'Activity not found');
      }
      return activity.getPublicFields();
    });
};
