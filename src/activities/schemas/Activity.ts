import { Schema, model } from 'mongoose';
import omit from 'lodash.omit';
import { v4 as uuidv4 } from 'uuid';

const COLLECTION_NAME = 'activities';

export interface IActivityField {
  fieldId: string;
  fieldName: string;
  value: any;
}

export interface IProject {
  id: string;
}

export interface ITask {
  id: string;
  duration: number;
}

export interface IActivity {
  id: string;
  comments: string;
  createdAt: Date;
  duration: number;
  endTime: Date;
  modifiedAt: Date;
  projects: IProject[];
  startTime: Date;
  tasks: ITask[];
  templateId: string;
  userId: string;
  values: IActivityField[];
  getPublicFields(): Partial<IActivity>;
}

const ActivityFieldSchema: Schema = new Schema<IActivityField>(
  {
    fieldId: { type: String, required: true },
    fieldName: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: false },
  },
  {
    _id: false,
  },
);

const ProjectSchema: Schema = new Schema<IProject>(
  {
    id: { type: String, required: true },
  },
  {
    _id: false,
  },
);

const TaskSchema: Schema = new Schema<ITask>(
  {
    id: { type: String, required: true },
    duration: { type: Number, required: true },
  },
  {
    _id: false,
  },
);

const ActivitySchema = new Schema<IActivity>(
  {
    id: { type: String, default: uuidv4 },
    comments: { type: String },
    createdAt: { type: Date, required: true },
    duration: { type: Number },
    endTime: { type: Date },
    modifiedAt: { type: Date, required: true },
    projects: { type: [ProjectSchema] },
    startTime: { type: Date },
    tasks: { type: [TaskSchema] },
    templateId: { type: String },
    userId: { type: String, required: true },
    values: { type: [ActivityFieldSchema] },
  },
  {
    versionKey: '__v',
  },
);

ActivitySchema.methods.getPublicFields = function () {
  return omit(this.toJSON(), ['_id', '__v', 'userId']);
};

const Activity = model<IActivity>('Activity', ActivitySchema, COLLECTION_NAME);

export default Activity;
