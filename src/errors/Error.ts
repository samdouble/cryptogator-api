import mongoose from 'mongoose';
import { DateTime } from 'luxon';

const COLLECTION_NAME = 'errors';

const ErrorSchema = new mongoose.Schema({
  error: { type: mongoose.Schema.Types.Mixed },
  operation: { type: String },
  timestamp: { type: Date, default: () => DateTime.now().toUTC().toJSDate() },
});

const Error = mongoose.model('Error', ErrorSchema, COLLECTION_NAME);

export default Error;
