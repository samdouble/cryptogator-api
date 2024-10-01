import { expect } from 'chai';
import chai from '../../../tests/chai';
import server from '../../../tests/server';
import { initializeDB, closeDB, emptyCollection } from '../../../tests/db';
import { createUserToken } from '../../../tests/utils';
import activitiesRoutes from '.';

describe('Activities', () => {
  before(done => {
    activitiesRoutes(server);
    initializeDB('TESTactivitiesGET', done);
  });

  after(done => {
    closeDB(done);
  });
    
  describe('GET /v1/activities', () => {
    let userToken: string | null = null;
    let user2Token: string | null = null;

    const createActivity = async (token: string, jsonActivity) => {
      const { ok, body } = await chai.request(server)
        .post('/v1/activities')
        .set('Cookie', token)
        .send(jsonActivity);
      console.info(body);
      if (!ok) {
        throw new Error();
      }
      return body.activity;
    };

    beforeEach(async function () {
      await emptyCollection('users');
      [userToken, user2Token] = await Promise.all([
        createUserToken({ name: 'user' }),
        createUserToken({ name: 'user2' }),
      ]);
    });

    afterEach(async function () {
      await emptyCollection('activities');
    });

    /*it('Should return 401 if the requester is not logged in', async function () {
      const { status, body } = await chai.request(server)
        .get('/v1/activities');
      expect(status).to.equal(401);
      expect(body).to.have.property('error');
    });*/

    it('Should return 200 with an activities array', async function () {
      const activity = await createActivity(userToken!, {});
      const activity2 = await createActivity(userToken!, {});
      const { status, body } = await chai.request(server)
        .get('/v1/activities')
        .set('Cookie', userToken!);
      expect(status).to.equal(200);
      expect(body).to.have.property('activities');
      expect(body.activities).to.be.an('array');
      expect(body.activities).to.have.length(2);
      expect(body.activities[0].id).to.equal(activity.id);
      expect(body.activities[0]).to.not.have.property('_id');
      expect(body.activities[0]).to.not.have.property('userId');
      expect(body.activities[1].id).to.equal(activity2.id);
      expect(body.activities[1]).to.not.have.property('_id');
      expect(body.activities[1]).to.not.have.property('userId');
    });

    it('Should not return other users\' activities, for privacy', async function () {
      const activity = await createActivity(userToken!, {});
      await createActivity(user2Token!, {});
      const { status, body } = await chai.request(server)
        .get('/v1/activities')
        .set('Cookie', userToken!);
      expect(status).to.equal(200);
      expect(body).to.have.property('activities');
      expect(body.activities).to.be.an('array');
      expect(body.activities).to.have.length(1);
      expect(body.activities[0].id).to.equal(activity.id);
    });
  });
});
