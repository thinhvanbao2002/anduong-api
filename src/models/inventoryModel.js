import mongoose from 'mongoose';

const InventorySchema = new mongoose.Schema(
  {
    idAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'admins'
    },
    idProduct: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'products'
    },
    amount: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true
  }
);

const Inventory = mongoose.model('inventorys', InventorySchema);
export default Inventory;
