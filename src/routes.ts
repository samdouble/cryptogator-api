import activities from './activities/routes';
import login from './login/routes';
import payments from './payments/routes';
import users from './users/routes';

export default app => {
  activities(app);
  login(app);
  payments(app);
  users(app);
};
