import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        idUser: {
            type: mongoose.Schema.Types.ObjectId,
            required: true, // Thay vì "require", đúng là "required"
            ref: 'users',
        },
        idVoucher: {
            type: mongoose.Schema.Types.ObjectId,
            required: false, // Thay vì "require", đúng là "required"
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
