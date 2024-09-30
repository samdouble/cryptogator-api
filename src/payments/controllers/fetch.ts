import Payment from '../schemas/Payment';

export default async (userId, options: { session?: any } = {}) => {
  return Payment
    .find({ userId })
    .sort({ createdAt: -1 })
    .session(options.session)
    .then(payments => payments.map(payment => payment.getPublicFields()));
};
