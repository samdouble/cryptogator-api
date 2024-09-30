import { Schema, model } from 'mongoose';
import omit from 'lodash.omit';
import { v4 as uuidv4 } from 'uuid';

const COLLECTION_NAME = 'cards';

export interface ICard {
  id: string;
  createdAt: Date;
  modifiedAt: Date;
  stripePaymentIntent: any;
  userId: string;
  getPublicFields(publicOnly?: boolean): Partial<ICard>;
}

const CardSchema: Schema = new Schema(
  {
    id: { type: String, default: uuidv4 },
    createdAt: { type: Date, required: true },
    modifiedAt: { type: Date, required: true },
    stripePaymentIntent: { type: Schema.Types.Mixed, required: true },
    userId: { type: String, required: true },
  },
  {
    versionKey: '__v',
  },
);

CardSchema.methods.getPublicFields = function () {
  return omit(this.toJSON(), ['_id', '__v', 'stripeCard', 'stripeSetupIntent']);
};

const Card = model<ICard>('Card', CardSchema, COLLECTION_NAME);

export default Card;
