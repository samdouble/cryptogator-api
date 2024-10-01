import bcrypt from 'bcrypt'; 
import { DateTime } from 'luxon';
import chai from './chai';
import server from './server';
import loginRoutes from '../src/login/routes';
import User from '../src/users/schemas/User';

export interface UserInfos {
  emailAddress?: string;
  name: string;
  password?: string;
}

export const createUser = async (userInfos: UserInfos) => {
  const { ok, body } = await chai.request(server)
    .post('/v1/signup')
    .send(userInfos);
  if (!ok) {
    throw new Error();
  }
  return body.user;
};

export const createUserToken = async (userInfos: UserInfos) => {
  const { name } = userInfos;
  const emailAddress = userInfos.emailAddress || `${name}@fikas.io`;
  const password = userInfos.password || 'Test1234';
  await User.create({
    createdAt: DateTime.now().toUTC().toJSDate(),
    emailAddress,
    modifiedAt: DateTime.now().toUTC().toJSDate(),
    name,
    password: bcrypt.hashSync(password, 10),
    stripeCustomer: {
      id: 'cus_X',
    },
  });

  loginRoutes(server);
  const { header } = await chai.request(server)
    .post('/v1/login')
    .send({
      emailAddress,
      password,
    });
  return header['set-cookie'][0];
};

export const createResource = async (token: string, route: string, resource: any) => {
  const { ok, status, body } = await chai.request(server)
    .post(`/v1/${route}`)
    .send(resource)
    .set('Cookie', token);
  if (!ok) {
    console.error(`Error when creating ${route}: code ${status}\n`, body.error);
  }
  return body;
};

export default {
  createUserToken,
  createResource,
};
