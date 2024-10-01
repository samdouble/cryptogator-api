import { expect } from 'chai';
import chai from '../../../tests/chai';
import { initializeDB, closeDB, emptyCollection } from '../../../tests/db';
import server from '../../../tests/server';
import { mockCreateCustomer, mockUpdateCustomer } from '../../../tests/stripe';
import { createUser, createUserToken } from '../../../tests/utils';
import usersRoutes from '.';

describe('Users', () => {
  before(done => {
    usersRoutes(server);
    initializeDB('TESTusersPATCH', done);
  });

  after(done => {
    closeDB(done);
  });

  describe('PATCH /v1/users/me', function () {
    let userToken: string | null = null;

    beforeEach(async function () {
      await emptyCollection('users');
      [userToken] = await Promise.all([
        createUserToken({ name: 'user' }),
      ]);
    });

    /*
    TODO
    return 404 if user not found
    */
  
    describe('body', function () {
      describe('id', function () {
        it('Should ignore the id property if it is specified', async function () {
          mockUpdateCustomer('cus_X');
          const { status, body } = await chai.request(server)
            .patch(`/v1/users/me`)
            .set('Cookie', userToken!)
            .send({
              id: 'my-weak-id',
            });
          expect(status).to.equal(200);
          expect(body).to.have.property('user');
          expect(body.user).to.have.property('id').to.not.equal('my-weak-id');
        });
      });

      describe('name', function () {
        it('Should return 200, even if it is not specified', async function () {
          mockUpdateCustomer('cus_X');
          const { status, body } = await chai.request(server)
            .patch('/v1/users/me')
            .set('Cookie', userToken!)
            .send({});
          expect(status).to.equal(200);
          expect(body).to.have.property('user');
          expect(body.user).to.have.property('id');
          expect(body.user.name).to.equal('user');
          expect(body.user.emailAddress).to.equal('user@fikas.io');
        });

        it('Should change the user\'s name if specified', async function () {
          mockUpdateCustomer('cus_X');
          const { status, body } = await chai.request(server)
            .patch('/v1/users/me')
            .set('Cookie', userToken!)
            .send({
              name: 'Bob',
            });
          expect(status).to.equal(200);
          expect(body).to.have.property('user');
          expect(body.user).to.have.property('id');
          expect(body.user.name).to.equal('Bob');
          expect(body.user.emailAddress).to.equal('user@fikas.io');
        });
      });

      describe('emailAddress', function() {
        it('Should return 200, even if no email address is specified', async function () {
          mockUpdateCustomer('cus_X');
          const { status, body } = await chai.request(server)
            .patch('/v1/users/me')
            .set('Cookie', userToken!)
            .send({});
          expect(status).to.equal(200);
          expect(body).to.have.property('user');
          expect(body.user).to.have.property('id');
          expect(body.user.name).to.equal('user');
          expect(body.user.emailAddress).to.equal('user@fikas.io');
        });

        it('Should return 400 if the email address is invalid', async function () {
          const { status, body } = await chai.request(server)
            .patch('/v1/users/me')
            .set('Cookie', userToken!)
            .send({
              name: 'Samuel Whittom',
              emailAddress: 'notanemail',
            });
          expect(status).to.equal(400);
          expect(body).to.have.property('error');
        });

        it('Should return 409 if the email address is already used', async function () {
          mockCreateCustomer();
          mockUpdateCustomer('cus_X');
          await createUser({
            name: 'Bob',
            emailAddress: 'email@email.com',
            password: 'Password1234',
          });
          const { status, body } = await chai.request(server)
            .patch('/v1/users/me')
            .set('Cookie', userToken!)
            .send({
              name: 'Samuel Whittom',
              emailAddress: 'email@email.com',
            });
          expect(status).to.equal(409);
          expect(body).to.have.property('error');
        });
      });

      /*
      // TODO
      describe('password', function() {
        it('Should ignore the password if it is specified', async function () {
          const { status, body } = await chai.request(server)
            .patch('/v1/users/me')
            .set('Cookie', userToken!)
            .send({
              name: 'Samuel Whittom',
              emailAddress: 'email@email.com',
              password: 'Password1234',
            });
          expect(status).to.equal(400);
          expect(body).to.have.property('error');
        });
      });
      */

      describe('language', function () {
        it('Should return 200, even if it is not specified', async function () {
          mockUpdateCustomer('cus_X');
          const { status, body } = await chai.request(server)
            .patch('/v1/users/me')
            .set('Cookie', userToken!)
            .send({
              name: 'Samuel Whittom',
              emailAddress: 'email@email.com',
            });
          expect(status).to.equal(200);
          expect(body).to.have.property('user');
          expect(body.user).to.have.property('id');
          expect(body.user.name).to.equal('Samuel Whittom');
          expect(body.user.emailAddress).to.equal('email@email.com');
        });

        it('Should return 400 if it is anything else other than "en" or "fr"', async function () {
          const { status, body } = await chai.request(server)
            .patch('/v1/users/me')
            .set('Cookie', userToken!)
            .send({
              name: 'Samuel Whittom',
              emailAddress: 'email@email.com',
              language: 'whatever',
            });
          expect(status).to.equal(400);
          expect(body).to.have.property('error');
        });
      });
    });
  });
});
