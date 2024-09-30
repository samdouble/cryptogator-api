import activities from './activities/routes';
import entities from './entities/routes';
import events from './events/routes';
import login from './login/routes';
import objectives from './objectives/routes';
import organizations from './organizations/routes';
import payments from './payments/routes';
import projects from './projects/routes';
import tasks from './tasks/routes';
import templates from './templates/routes';
import users from './users/routes';

export default app => {
  activities(app);
  entities(app);
  events(app);
  login(app);
  objectives(app);
  organizations(app);
  payments(app);
  projects(app);
  tasks(app);
  templates(app);
  users(app);
};
