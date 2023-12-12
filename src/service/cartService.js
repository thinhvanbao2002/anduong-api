import CartModel from "../models/cartModel.js";
import bcrypt from "bcrypt";

const getCart = async ({ idUser }) => {
    try {
        console.log(idUser);
        const existingCart = await CartModel.find({ idUser: idUser });
        return existingCart; // Trả về existingCart dù có tìm thấy hay không
    } catch (error) {
        console.error(error.message);
        throw new Error("Error while fetching cart data");
    }
};

const searchCart = async ({ perPage, page, keyword }) => {
    const regexKeyword = new RegExp(keyword, 'i'); // 'i' cho phép tìm kiếm không phân biệt chữ hoa chữ thường

    const getKeyword = {
        $or: [
            { title: { $regex: regexKeyword } },
        ]
    };

    const count = await CartModel.countDocuments(getKeyword);
    const data = await CartModel.find(getKeyword).skip((page - 1) * perPage).limit(perPage);

    if (count === 0 || data.length === 0) {
        throw new Error("Không tìm thấy danh mục nào");
    }

    const result = { count, data };
    return result;
};

const addCart = async ({ idUser, idProduct }) => {
    const createdCart = await CartModel.create({
        idUser: idUser,
        idProduct: idProduct
    });

    if (createdCart) {
        return createdCart;
    } else {
        throw new Error("Cant add ti cart");
    }
}

const deleteCart = async ({ idCart }) => {
    const deletedCart = await CartModel.findByIdAndRemove(idCart);
    if (deletedCart) {
        return deletedCart;
    } else {
        throw new Error("Cart not found for the specified product");
    }
}



export default {
    getCart,
    searchCart,
    addCart,
    deleteCart
}