import HttpStatus from 'http-status-codes';
import User from '../schemas/User';
import { ExpressRouteError } from '../../utils/ExpressRouteError';

export default async (filter, options: { session?: any } = {}, publicOnly = true) => {
  return User
    .findOne(filter)
    .session(options.session)
    .exec()
    .then(user => {
      if (!user) {
        throw new ExpressRouteError(HttpStatus.BAD_REQUEST, 'User not found');
      }
      return user.json(publicOnly);
    });
};
