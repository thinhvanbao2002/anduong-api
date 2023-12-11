import CartModel from "../models/cartModel.js";
import bcrypt from "bcrypt";

const getCart = async ({ idUser }) => {
    console.log(idUser);
    const existingCart = await CartModel.find({ idUser: idUser });
    if (existingCart.length > 0) {
        return existingCart;
    } else {
        throw new Error("Can't find cart");
    }
}


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