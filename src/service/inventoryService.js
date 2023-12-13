import DetailImageModel from "../models/detailImageModel.js";
import DetailOrder from "../models/detailOrderModel.js";
import InventoryModel from "../models/inventoryModel.js";

const getInventory = async (page, perPage) => {
  const count = await InventoryModel.count();
  const data = await InventoryModel.find()
    .populate('idAdmin')
    .populate('idProduct')
    .skip((page - 1) * perPage)
    .limit(perPage);
  if (count === 0 || data.length === 0) {
    throw new Error("Can't get Inventory");
  }
  const result = { count, data };
  return result;
}

const searchInventory = async ({ perPage, keyword, page }) => {
  const count = await InventoryModel.countDocuments({ idProduct: keyword });
  const data = await InventoryModel
    .find({ idProduct: keyword })
    .skip((page - 1) * perPage)
    .limit(perPage);

  if (count === 0 || data.length === 0) {
    throw new Error("Can't find Inventory");
  }

  const result = { count, data };
  return result;
}

const getInventoryById = async ({ idInventory }) => {
  const data = await InventoryModel.findById(idInventory);
  if (data) {
    return data;
  } else {
    throw new Error("Can't get inventory");
  }

}

const getInventoryByDate = async ({ idCategory }) => {
  const data = await InventoryModel.find({ idCategory: idCategory });
  if (data.length > 0) {
    return data;
  } else {
    throw new Error("Can't get products for the specified category");
  }
}

const createInventory = async ({ idAdmin, idProduct, amount, price, description }) => {
  const createdInventory = await InventoryModel.create({
    idAdmin: idAdmin,
    idProduct: idProduct,
    amount: amount,
    price: price,
    description: description,
  });

  if (!createdInventory) {
    throw new Error("Can't create Inventory");
  }

  return createdInventory;
};


const updateInventory = async ({ idProduct, name, imageName, detailImageNames, unit, price, productsAvailable, description, idCategory }) => {
  const existingProduct = await InventoryModel.findById(idProduct);
  if (!existingProduct) {
    throw new Error("Can't find Product");
  }

  existingProduct.name = name;

  if (imageName !== null) {
    existingProduct.image = imageName;
  }

  existingProduct.unit = unit;
  existingProduct.price = price;
  existingProduct.productsAvailable = productsAvailable;
  existingProduct.description = description;
  existingProduct.idCategory = idCategory;

  const updateProducted = await existingProduct.save();

  if (!updateProducted) {
    throw new Error("Can't update Product");
  }

  const createdImageDetails = [];

  for (const detailImageName of detailImageNames) {
    const createImageDetail = await DetailImageModel.create({
      idProduct: existingProduct._id,
      detailImage: detailImageName
    });

    if (!createImageDetail) {
      throw new Error("Can't create DetailImage");
    }

    createdImageDetails.push(createImageDetail);
  }

  return { updateProducted, createdImageDetails };
}


const deleteInventory = async (idProduct) => {
  const checkOrder = await DetailOrder.findOne({ idProduct });
  if (checkOrder) {
    throw new Error("Cannot delete product because there are order associated with it.");
  }

  const deletedProduct = await InventoryModel.findByIdAndDelete(idProduct);
  const deletedDetailImageProduct = await DetailImageModel.findByIdAndDelete(idProduct);
  if (!deletedProduct) {
    throw new Error("Can't delete Product");
  }
  return { deletedProduct, deletedDetailImageProduct };
}

const exportExcel = async () => {
  try {
    const dataOProducts = await InventoryModel.find()
      .populate('idCategory');

    if (!dataOProducts) {
      throw new Error("Can't find product");
    }

    return dataOProducts;
  } catch (error) {
    throw error;
  }
};

export default {
  getInventory,
  searchInventory,
  getInventoryById,
  getInventoryByDate,
  createInventory,
  updateInventory,
  deleteInventory,
  exportExcel
}