import { expect } from 'chai';
import chai from '../../../tests/chai';
import { initializeDB, closeDB, emptyCollection } from '../../../tests/db';
import server from '../../../tests/server';
import { mockCreateCustomer } from '../../../tests/stripe';
import { createUser } from '../../../tests/utils';
import usersRoutes from '.';

describe('Users', () => {
  before(done => {
    usersRoutes(server);
    initializeDB('TESTusersPOST', done);
  });

  after(done => {
    closeDB(done);
  });

  describe('POST /v1/signup', () => {
    beforeEach(async function () {
      await emptyCollection('users');
    });

    describe('body', function() {
      describe('name', function() {
        it('Should return 400 if no name is specified', async function () {
          const { status, body } = await chai.request(server)
            .post('/v1/signup')
            .send({
              emailAddress: 'email@email.com',
              password: 'Password1234',
            });
          expect(status).to.equal(400);
          expect(body).to.have.property('error');
        });
      });

      describe('emailAddress', function() {
        it('Should return 400 if no email address is specified', async function () {
          const { status, body } = await chai.request(server)
            .post('/v1/signup')
            .send({
              name: 'Samuel Whittom',
              password: 'Password1234',
            });
          expect(status).to.equal(400);
          expect(body).to.have.property('error');
        });

        it('Should return 400 if the email address is invalid', async function () {
          const { status, body } = await chai.request(server)
            .post('/v1/signup')
            .send({
              name: 'Samuel Whittom',
              emailAddress: 'notanemail',
              password: 'Password1234',
            });
          expect(status).to.equal(400);
          expect(body).to.have.property('error');
        });

        it('Should return 409 if the email address is already used', async function () {
          mockCreateCustomer();
          await createUser({
            name: 'Bob',
            emailAddress: 'email@email.com',
            password: 'Password1234',
          });
          const { status, body } = await chai.request(server)
            .post('/v1/signup')
            .send({
              name: 'Samuel Whittom',
              emailAddress: 'email@email.com',
              password: 'Password5678',
            });
          expect(status).to.equal(409);
          expect(body).to.have.property('error');
        });
      });

      describe('password', function() {
        it('Should return 400 if no password is specified', async function () {
          const { status, body } = await chai.request(server)
            .post('/v1/signup')
            .send({
              name: 'Samuel Whittom',
              emailAddress: 'email@email.com',
            });
          expect(status).to.equal(400);
          expect(body).to.have.property('error');
        });
      });

      describe('language', function () {
        it('Should return 200 even if it is not specified', async function () {
          mockCreateCustomer();
          const { status, body } = await chai.request(server)
            .post('/v1/signup')
            .send({
              name: 'Samuel Whittom',
              emailAddress: 'email@email.com',
              password: 'Password1234',
            });
          expect(status).to.equal(201);
          expect(body).to.have.property('user');
          expect(body.user.name).to.have.equal('Samuel Whittom');
          expect(body.user.emailAddress).to.have.equal('email@email.com');
          expect(body.user).to.not.have.property('password');
        });

        it('Should return 400 if it is anything else other than "en" or "fr"', async function () {
          const { status, body } = await chai.request(server)
            .post('/v1/signup')
            .send({
              name: 'Samuel Whittom',
              emailAddress: 'email@email.com',
              password: 'Password1234',
              language: 'whatever',
            });
          expect(status).to.equal(400);
          expect(body).to.have.property('error');
        });
      });
    });

    /*
    // TODO
    it('Should hash the password in the database', async function () {
      const { status, body } = await chai.request(server)
        .post('/v1/signup')
        .send({
          name: 'Samuel Whittom',
          emailAddress: 'email@email.com',
        });
      expect(status).to.equal(400);
      expect(body).to.have.property('error');
    });

    it('Should be able to login after successful signup', async function () {
      await chai.request(server)
        .post('/v1/signup')
        .send({
          name: 'Samuel Whittom',
          emailAddress: 'email@email.com',
          password: 'Password1234',
        });
      const { status, body } = await chai.request(server)
        .post('/v1/login');
      expect(status).to.equal(400);
      expect(body).to.have.property('error');
    });
    */
  });
});
