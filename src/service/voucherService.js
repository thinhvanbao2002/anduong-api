import VoucherModel from "../models/voucherModel.js";
import OrderModel from "../models/orderModel.js";
import moment from "moment";

const getVoucher = async () => {
  const count = await VoucherModel.countDocuments();
  const data = await VoucherModel.find();
  if (count === 0 || data.length === 0) {
    throw new Error("Can't get Voucher");
  }

  // Chuyển đổi timestamp của createdAt và updatedAt
  const formattedData = data.map(voucher => ({
    ...voucher.toObject(),
    expiration_date: moment(voucher.expiration_date).format('MM:HH DD-MM-YYYY'),
    createdAt: moment(voucher.createdAt).format('MM:HH DD-MM-YYYY'),
    updatedAt: moment(voucher.updatedAt).format('MM:HH DD-MM-YYYY'),
  }));

  const result = { count, data: formattedData };
  return result;
};


const searchVoucher = async ({ keyword }) => {
  const getKeyword = {
    $or: [
      { title: { $regex: keyword, $options: 'i' } },
    ]
  };
  const count = await VoucherModel.countDocuments(getKeyword);
  const data = await VoucherModel.find(getKeyword);
  if (count === 0 || data.length === 0) {
    throw new Error("Can't find Voucher");
  }
  const result = { count, data };
  return result;
};

const getVoucherById = async ({ idVoucher }) => {
  const data = await VoucherModel.findById(idVoucher);
  if (data.length === 0) {
    throw new Error("Can't get Voucher");
  }
  const result = { data };
  return result;
};

const createVoucher = async ({ title, off, expiration_date }) => {
  const createdVoucher = await VoucherModel.create({
    title: title,
    off: off,
    expiration_date: expiration_date
  });

  if (createdVoucher) {
    return createdVoucher;
  } else {
    throw new Error("Can't create voucher");
  }
};

const updateVoucher = async ({ idVoucher, title, off, expiration_date }) => {
  const existingVoucher = await VoucherModel.findById(idVoucher);
  if (!existingVoucher) {
    throw new Error("Can't find Voucher");
  }

  existingVoucher.title = title;
  existingVoucher.off = off;
  existingVoucher.expiration_date = expiration_date;

  const updatedVoucher = await existingVoucher.save();

  if (!updatedVoucher) {
    throw new Error("Can't update Voucher");
  }

  return updatedVoucher;
};

const deleteVoucher = async ({ idVoucher }) => {
  const checkOrder = await OrderModel.findOne({ idVoucher });
  if (checkOrder) {
    throw new Error("Cannot delete voucher because there are order associated with it.");
  }

  const deletedVoucher = await VoucherModel.findByIdAndDelete(idVoucher);
  if (!deletedVoucher) {
    throw new Error("Can't delete Voucher");
  }
  return deletedVoucher;
};

export default {
  getVoucher,
  searchVoucher,
  getVoucherById,
  createVoucher,
  updateVoucher,
  deleteVoucher
};
