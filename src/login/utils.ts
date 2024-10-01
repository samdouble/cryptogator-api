import HttpStatus from 'http-status-codes';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { ExpressRouteError } from '../utils/ExpressRouteError';

export interface IDecryptedToken {
  iat: number;
  exp: number;
  id: string;
}

export interface IDecryptTokenResponse {
  decodedToken?: IDecryptedToken;
  valid: boolean;
}

const schema = Joi.object({
  iat: Joi.number().required(),
  exp: Joi.number().required(),
  id: Joi.string().required(),
});

export const encrypt = id => {
  const now = Date.now();
  return jwt.sign(
    {
      iat: now,
      exp: now + 86400000,
      id,
    },
    process.env.JWT_SECRET,
    { algorithm: 'HS256' },
  );
};

export function decrypt(token): Promise<IDecryptTokenResponse> {
  return new Promise(resolve => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err || schema.validate(decodedToken).error) {
        resolve({
          valid: false,
        });
        return;
      }
      resolve({ valid: true, decodedToken });
    });
  });
}

export const getTokenFromRequest = req => {
  if (req.cookies && req.cookies.token) {
    return { from: 'cookies', token: req.cookies.token };
  }

  if (req.headers && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      return { from: 'headers', token: parts[1] };
    }
  }
  return {};
};

export async function executeIfAuthorized(operation) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await operation({ session });
    await session.commitTransaction();
    session.endSession();
    return result;
  } catch (error) {
    console.info(error);
    await session.abortTransaction();
    session.endSession();
    if (error instanceof ExpressRouteError) {
      return {
        code: error.code,
        response: {
          error: error.message,
        },
      };
    }
    return {
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      response: {
        error,
      },
    };
  }
}

export default {
  getTokenFromRequest,
  encrypt,
  decrypt,
  executeIfAuthorized,
};
