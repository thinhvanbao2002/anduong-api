import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phone: {
            type: String,
            required: true,
        },
        permission: {
            type: Number,
            required: true,
        }
    },
    {
        timestamps: true
    }
);

const Admin = mongoose.model('admins', adminSchema);
export default Admin;
