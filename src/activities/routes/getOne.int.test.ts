import { expect } from 'chai';
import chai from '../../../tests/chai';
import server from '../../../tests/server';
import { initializeDB, closeDB, emptyCollection } from '../../../tests/db';
import { createUserToken } from '../../../tests/utils';
import activitiesRoutes from '.';

describe('Activities', () => {
  before(done => {
    activitiesRoutes(server);
    initializeDB('TESTactivitiesGETONE', done);
  });

  after(done => {
    closeDB(done);
  });

  describe('GET /v1/activities/:id', () => {
    let userToken: string | null = null;
    let user2Token: string | null = null;

    const createActivity = async (token: string, jsonActivity) => {
      const { ok, body } = await chai.request(server)
        .post('/v1/activities')
        .set('Cookie', token)
        .send(jsonActivity);
      if (!ok) {
        throw new Error();
      }
      return body.activity;
    };

    before(async function () {
      [userToken, user2Token] = await Promise.all([
        createUserToken({ name: 'user' }),
        createUserToken({ name: 'user2' }),
      ]);
    });

    afterEach(async function () {
      await emptyCollection('activities');
    });

    /*
    it('Should return 401 if the requester is not logged in', async function () {
      const activity = await createActivity(user2Token!, {});
      const { status, body } = await chai.request(server)
        .get(`/v1/activities/${activity.id}`);
      expect(status).to.equal(401);
      expect(body).to.have.property('error');
    });
    */

    it('Should return 404 if the activity does not exist', async function () {
      const { status, body } = await chai.request(server)
        .get('/v1/activities/doesnt-exist')
        .set('Cookie', userToken!);
      expect(status).to.equal(404);
      expect(body).to.have.property('error');
    });

    it('Should return 404 if the activity exists but belongs to another user, for privacy', async function () {
      const activity = await createActivity(user2Token!, {});
      const { status, body } = await chai.request(server)
        .get(`/v1/activities/${activity.id}`)
        .set('Cookie', userToken!);
      expect(status).to.equal(404);
      expect(body).to.have.property('error');
    });

    it('Should return 200 with the activity if it has been found and belongs to the user', async function () {
      const activity = await createActivity(userToken!, {});
      const { status, body } = await chai.request(server)
        .get(`/v1/activities/${activity.id}`)
        .set('Cookie', userToken!);
      expect(status).to.equal(200);
      expect(body).to.have.property('activity');
      expect(body.activity.id).to.equal(activity.id);
      expect(body.activity).to.not.have.property('_id');
      expect(body.activity).to.not.have.property('userId');
    });
  });
});
