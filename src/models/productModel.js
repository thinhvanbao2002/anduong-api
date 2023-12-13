import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    sold: {
      type: Number,
      required: true,
    },
    productsAvailable: {
      type: Number,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    idCategory: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'categorys'
    },
  },
  {
    timestamps: true
  }
);

const Product = mongoose.model('products', productSchema);
export default Product;
