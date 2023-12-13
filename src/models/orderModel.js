import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        idUser: {
            type: mongoose.Schema.Types.ObjectId,
            required: true, 
            ref: 'users',
        },
        idVoucher: {
            type: mongoose.Schema.Types.ObjectId,
            required: false, 
            ref: 'vouchers',
        },
        total: {
            type: Number,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model('orders', orderSchema); // Sử dụng "model" thay vì "Schema"

export default Order;
