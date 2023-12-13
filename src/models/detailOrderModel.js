import mongoose from "mongoose";

const detailOrderSchema = new mongoose.Schema(
    {
        idOrder: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'orders',
        },
        idProduct: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'products',
        },
        amount: {
            type: Number,
            required: true,
        },
        cost: {
            type: Number,
            required: true
        }
    }
)

const DetailOrder = mongoose.model('detailOrders', detailOrderSchema);
export default DetailOrder;