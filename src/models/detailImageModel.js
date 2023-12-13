import mongoose from "mongoose";

const detailImageSchema = new mongoose.Schema(
    {
        idProduct: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'products'
        },
        detailImage: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true
    }
)

const DetailImage = mongoose.model('detailImages', detailImageSchema);
export default DetailImage;