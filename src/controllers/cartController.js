import cartService from "../service/cartService.js";

const getCart = async (req, res) => {
  try {
    const idUser = req.params.id;
    const response = await cartService.getCart({ idUser });
    return res.status(200).json(
      {
        status: "OK",
        data: response
      }
    )
  } catch (error) {
    return res.status(400).json(
      {
        status: "ERR",
        error: error.message
      }
    )
  }
}

const addCart = async (req, res) => {
  try {
    //truyền vào id với số lượng
    const { idUser, idProduct } = req.body;

    if (!idUser || !idProduct) {
      throw new Error("Input is required")
    }

    const response = await cartService.addCart({ idUser, idProduct });
    return res.status(200).json(
      {
        status: "OK",
        data: response
      }
    )
  } catch (error) {
    return res.status(400).json(
      {
        status: "ERR",
        error: error.message
      }
    )
  }
}

const deleteCart = async (req, res) => {
  try {
    const idCart = req.params.id;

    if (!idCart) {
      throw new Error("Input is required")
    }

    const response = await cartService.deleteCart({ idCart });
    return res.status(200).json(
      {
        status: "OK",
        data: response
      }
    )
  } catch (error) {
    return res.status(400).json(
      {
        status: "ERR",
        error: error.message
      }
    )
  }
}


export default {
  getCart,
  addCart,
  deleteCart,
}