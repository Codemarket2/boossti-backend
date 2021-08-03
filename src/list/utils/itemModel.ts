import { Schema, model, Model, Document } from 'mongoose';

export interface IItem extends Document {
  title: string;
  description: string;
  active: boolean;
  extra: [];
}

const ItemSchema: Schema = new Schema({
  title: String,
  description: String,
  active: {
    type: Boolean,
    default: true,
  },
  extra: [],
});

const Item: Model<IItem> = model('Item', ItemSchema);

export default Item;
