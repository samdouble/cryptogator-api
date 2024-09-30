import Card from '../../schemas/Card';

export default async (userId, options: { session?: any } = {}) => Card
  .find({
    userId,
  })
  .session(options.session)
  .exec()
  .then(cards => cards.map(card => card.getPublicFields()));
