import OrderModel from "../models/orderModel.js";
import DetailOrder from "../models/detailOrderModel.js";
import UserModel from "../models/userModel.js";
import ProductModel from "../models/productModel.js";

const getOrder = async ({ perPage, page }) => {
  const count = await OrderModel.count()
    .skip((page - 1) * perPage).limit(perPage);

  const dataOrder = await OrderModel.find()
    .populate({
      path: 'idUser',
      select: 'fullName phone',
    })
    .populate('idVoucher')
    .skip((page - 1) * perPage).limit(perPage);

  if (!dataOrder) {
    throw new Error("Can't find order");
  }

  const result = await Promise.all(dataOrder.map(async (order) => {
    const idOrder = order._id;
    const detailOrder = await DetailOrder.find({ idOrder: idOrder });
    return { ...order.toObject(), detailOrder };
  }));

  return { count, result };
}

const searchOrder = async ({ perPage, keyword, page }) => {
  const getKeyword = {
    $or: [
      { _id: keyword },
      { idUser: keyword },
    ]
  };

  const data = await OrderModel
    .find(getKeyword)
    .populate({
      path: 'idUser',
      select: 'fullName phone',
    })
    .populate('idVoucher')
    .limit(perPage)
    .skip((page - 1) * perPage);

  if (data.length === 0) {
    throw new Error("Can't find any matching orders.");
  }

  const result = await Promise.all(data.map(async (order) => {
    const idOrder = order._id;
    const detailOrder = await DetailOrder.find({ idOrder: idOrder });
    return { ...order.toObject(), detailOrder };
  }));

  return result;
};

const searchOrderByDate = async ({ startDate, endDate, page, perPage }) => {
  try {
    const data = await OrderModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
    ])
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);

    const count = data.length;

    // Check if there is any data returned
    if (data.length > 0) {
      return { count, data };
    } else {
      throw new Error("No records found");
    }
  } catch (error) {
    throw new Error(`Error searching for order: ${error.message}`);
  }
};


const createOrder = async ({ idUser, idVoucher, total, products }) => {
  // Tạo đơn hàng chính
  let createdOrder;

  if (idVoucher === "") {
    createdOrder = await OrderModel.create({
      idUser: idUser,
      total: total
    });
  } else {
    createdOrder = await OrderModel.create({
      idUser: idUser,
      idVoucher: idVoucher,
      total: total
    });
  }

  if (!createdOrder) {
    throw new Error("Can't create Order");
  }

  // Tạo các bản ghi DetailOrder cho từng sản phẩm
  const detailOrders = await Promise.all(products.map(async (product) => {
    return DetailOrder.create({
      idOrder: createdOrder._id,
      idProduct: product.id,
      amount: product.amount,
      cost: product.cost
    });
  }));

  // Kiểm tra xem tất cả các bản ghi DetailOrder có được tạo thành công không
  const areDetailOrdersCreated = detailOrders.every(detailOrder => !!detailOrder);

  if (!areDetailOrdersCreated) {
    // Nếu có vấn đề khi tạo bản ghi DetailOrder, hãy xóa đơn hàng đã tạo
    await OrderModel.findByIdAndDelete(createdOrder._id);
    throw new Error("Can't create DetailOrders");
  }

  return { createdOrder, detailOrders };
};




const updateOrder = async ({ idCategory, title }) => {
  const exitstingCategory = await CategoryModel.findById(idCategory);
  if (!exitstingCategory) {
    throw new Error("Can't find Category");
  }

  exitstingCategory.title = title;

  const updatedCategory = await exitstingCategory.save();

  if (!updatedCategory) {
    throw new Error("Can't update Product");
  }

  return { updatedCategory };
}


const deleteOrder = async ({ idOrder }) => {
  console.log(idOrder);
  const deleteDetailOrder = await DetailOrder.deleteMany({ idOrder: idOrder });
  const deletedOrder = await OrderModel.findByIdAndDelete(idOrder);
  if (!deleteDetailOrder || !deletedOrder) {
    throw new Error("Can't delete Order");
  }
  return { deletedOrder, deleteDetailOrder };
}

const exportExcel = async () => {
  try {
    const dataOrder = await OrderModel.find()
      .populate({
        path: 'idUser',
        select: 'fullName phone address',
      })
      .populate('idVoucher');

    if (!dataOrder) {
      throw new Error("Can't find order");
    }

    const dataDetailOrder = await DetailOrder.find()
      .populate({
        path: 'idProduct',
        select: 'name price',
      })

    if (!dataDetailOrder) {
      throw new Error("Can't find detailorder");
    }

    const result = dataOrder.map(order => {
      const detailOrders = dataDetailOrder.filter(detailOrder => detailOrder.idOrder.equals(order._id));
      return { ...order.toObject(), detailOrders };
    });
    console.log("RS", result);

    return result;
  } catch (error) {
    throw error;
  }
};




export default {
  getOrder,
  searchOrder,
  searchOrderByDate,
  createOrder,
  updateOrder,
  deleteOrder,
  exportExcel
}