import { Schema, model } from 'mongoose';
import omit from 'lodash.omit';
import { v4 as uuidv4 } from 'uuid';

const COLLECTION_NAME = 'users';

export interface IApiKey {
  createdAt: Date;
  expiresAt: Date;
  key: string;
  lastUsedAt: Date;
  name: string;
  permissions: string[];
}

const APIKeySchema = new Schema<IApiKey>(
  {
    createdAt: { type: Date },
    expiresAt: { type: Date, required: true },
    key: { type: String },
    lastUsedAt: { type: Date },
    name: { type: String, required: true },
    permissions: { type: [String], default: [] },
  },
  {
    _id: false,
  },
);

export interface IUser {
  apiKeys: IApiKey[];
  id: string;
  censoredWords: string[];
  createdAt: Date;
  emailAddress: string;
  language: 'en' | 'fr';
  modifiedAt: Date;
  name: string;
  password: string;
  stripeCustomer: any;
  json(publicOnly?: boolean): Partial<IUser>;
}

const UserSchema: Schema = new Schema(
  {
    apiKeys: { type: [APIKeySchema], default: [] },
    id: { type: String, default: uuidv4 },
    censoredWords: { type: [String] },
    createdAt: { type: Date },
    emailAddress: { type: String, required: true },
    language: { type: String, enum: ['fr', 'en'], default: 'en' },
    modifiedAt: { type: Date, required: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    stripeCustomer: { type: Schema.Types.Mixed },
  },
  {
    versionKey: '__v',
  },
);

UserSchema.methods.json = function (publicOnly = true) {
  if (publicOnly) {
    return omit(this.toJSON(), ['_id', '__v', 'password', 'stripeCustomer']);
  }
  return omit(this.toJSON(), ['_id', '__v']);
};

const User = model<IUser>('User', UserSchema, COLLECTION_NAME);

export default User;
