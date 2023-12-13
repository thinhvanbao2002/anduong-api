import ProductModel from "../models/productModel.js";
import DetailImageModel from "../models/detailImageModel.js";

const getProduct = async (page, perPage) => {
    const count = await ProductModel.count();
    const data = await ProductModel.find().limit(perPage).skip((page - 1) * perPage);
    if (count === 0 || data.length === 0) {
        throw new Error("Can't get Product");
    }
    const result = { count, data };
    return result;
}

const searchProduct = async ({ perPage, keyword, page }) => {
    const getKeyword = {
        $or: [ //tìm bản ghi phù hợp ở cả 3 trường dữ liệu
            { name: { $regex: keyword, $options: 'i' } }, //regex: biểu thức tìm chuỗi khớp, option "i": k phân biệt hoa thường
        ]
    };
    const count = await ProductModel.countDocuments(getKeyword);
    const data = await ProductModel.find(getKeyword).limit(perPage).skip((page - 1) * perPage);
    if (count === 0 || data.length === 0) {
        throw new Error("Can't find Product");
    }
    const result = { count, data };
    return result;
}

const getProductById = async ({ idProduct }) => {
    const data = await ProductModel.findById(idProduct);
    if (data) {
        return data;
    } else {
        throw new Error("Can't get product");
    }

}

const getProductByCategory = async ({ idCategory }) => {
    const data = await ProductModel.find({ idCategory: idCategory });
    if (data.length > 0) {
        return data;
    } else {
        throw new Error("Can't get products for the specified category");
    }
}

const createProduct = async ({ name, imageName, detailImageNames, price, productsAvailable, description, idCategory }) => {
    const createProducted = await ProductModel.create({
        name: name,
        image: imageName,
        price: price,
        sold: 0,
        productsAvailable: productsAvailable,
        description: description,
        idCategory: idCategory,
    });

    if (!createProducted) {
        throw new Error("Can't create Product");
    }

    const createdImageDetails = [];

    for (const detailImageName of detailImageNames) {
        const createImageDetail = await DetailImageModel.create({
            idProduct: createProducted._id,
            detailImage: detailImageName
        });

        if (!createImageDetail) {
            throw new Error("Can't create DetailImage");
        }

        createdImageDetails.push(createImageDetail);
    }

    return { createProducted, createdImageDetails };
};


const updateProduct = async ({ idProduct, name, imageName, detailImageNames, price, productsAvailable, description, idCategory }) => {
    const existingProduct = await ProductModel.findById(idProduct);
    if (!existingProduct) {
        throw new Error("Can't find Product");
    }

    existingProduct.name = name;

    if (imageName !== null) {
        existingProduct.image = imageName;
    }

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


const deleteProduct = async (idProduct) => {
    const deletedProduct = await ProductModel.findByIdAndDelete(idProduct);
    const deletedDetailImageProduct = await DetailImageModel.findByIdAndDelete(idProduct);
    if (!deletedProduct) {
        throw new Error("Can't delete Product");
    }
    return { deletedProduct, deletedDetailImageProduct };
}

const exportExcel = async () => {
    try {
        const dataOProducts = await ProductModel.find()
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
    getProduct,
    searchProduct,
    getProductById,
    getProductByCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    exportExcel
}