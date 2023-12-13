import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
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
    isVerified: {
      type: Boolean,
      required: true
    },
    phone: {
      type: String,
      required: false,
    },
    avt: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    status: {
      type: Boolean,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model('users', userSchema);
export default User;
