import { Schema, model } from 'mongoose';
import omit from 'lodash.omit';
import { v4 as uuidv4 } from 'uuid';

const COLLECTION_NAME = 'payments';

export interface IPayment {
  id: string;
  amount: number;
  createdAt: Date;
  userId: string;
  getPublicFields(): Partial<IPayment>;
}

const PaymentSchema: Schema = new Schema<IPayment>(
  {
    id: { type: String, default: uuidv4 },
    amount: { type: Number, required: true },
    createdAt: { type: Date, required: true },
    userId: { type: String, required: true },
  },
  {
    versionKey: '__v',
  },
);

PaymentSchema.methods.getPublicFields = function () {
  return omit(this.toJSON(), ['_id']);
};

const Payment = model<IPayment>('Payment', PaymentSchema, COLLECTION_NAME);

export default Payment;
