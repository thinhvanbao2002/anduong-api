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
    addCart,
    deleteCart
}