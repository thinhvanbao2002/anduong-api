import OrderModel from "../models/orderModel.js";
import DetailOrder from "../models/detailOrderModel.js";
import UserModel from "../models/userModel.js";

const getOrder = async ({ perPage, page }) => {
    const count = await OrderModel.count();
    const data = await OrderModel.find().limit(perPage).skip((page - 1) * perPage);;
    if (count === 0 || data.length === 0) {
        throw new Error("Can't get Order");
    }
    const result = { count, data };
    return result;
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
        .limit(perPage)
        .skip((page - 1) * perPage);

    if (data.length === 0) {
        throw new Error("Can't find any matching orders.");
    }

    return data;
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

export default {
    getOrder,
    searchOrder,
    createOrder,
    updateOrder,
    deleteOrder
}