import DetailImageModel from "../models/detailImageModel.js";
import DetailOrder from "../models/detailOrderModel.js";
import InventoryModel from "../models/inventoryModel.js";

const getInventory = async (page, perPage) => {
  const count = await InventoryModel.count();
  const data = await InventoryModel.find()
    .populate({
      path: 'idAdmin',
      select: 'fullName'
    })
    .populate({
      path: 'idProduct',
      select: 'name'
    })
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

const getInventoryByDate = async ({ startDate, endDate, page, perPage }) => {
  try {
    const data = await InventoryModel.aggregate([
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
    throw new Error(`Error searching for inventory: ${error.message}`);
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


const deleteInventory = async ({ idInventory }) => {
  const deleltedInventory = await InventoryModel.findByIdAndDelete(idInventory);
  if (!deleltedInventory) {
    throw new Error("Can't delete Inventory");
  }
  return { deleltedInventory };
}

const exportExcel = async () => {
  try {
    const dataInventory = await InventoryModel.find()
      .populate({
        path: 'idProduct',
        select: 'name'
      });

    if (!dataInventory) {
      throw new Error("Can't find dataInventory");
    }

    return dataInventory;
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