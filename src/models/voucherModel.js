import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        off: {
            type: Number,
            required: true,
        },
        expiration_date: {
            type: Date,
            required: true,
        }
    },
    {
        timestamps: true,
    }
)

const Voucher = mongoose.model('vouchers', voucherSchema); // Fix: Change `mongoose.Schema` to `mongoose.model`
export default Voucher;
