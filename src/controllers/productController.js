import productService from "../service/productService.js";
import Joi from "joi";
import formidable from "formidable";
import path from "path";
import fs from "fs";

const Schema = Joi.object().keys({
    name: Joi.string().min(3).max(30).label('name'),
    image: Joi.string().min(3).label('image'),
    price: Joi.number().label('price'),
    sold: Joi.number().label('fullName'),
    productsAvailable: Joi.number().label('email'),
    description: Joi.string().label('phoneNumber'),
    idCategory: Joi.string().label('idCategory'),
});

const getProduct = async (req, res) => {
    try {
        const perPage = 12;
        let page = parseInt(req.query.page) || 1;
        page = Math.max(page, 1);
        const response = await productService.getProduct(page, perPage);
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

const searchProduct = async (req, res) => {
    try {
        const perPage = 2;
        let keyword = req.query.keyword || "";
        let page = parseInt(req.query.page) || 1;
        page = Math.max(page, 1);

        const response = await productService.searchProduct({ perPage, keyword, page });
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

const getById = async (req, res) => {
    try {
        const idProduct = req.params.id;

        const response = await productService.getProductById({ idProduct });
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

const createProduct = async (req, res) => {
    try {
        const { name, price, productsAvailable, description, idCategory } = req.body;
        const image = req.files.image;
        const detailImages = req.files.detailImages;

        if (!name || !image || !price || !productsAvailable || !description || !idCategory) {
            throw new Error(`Input is required`);
        }

        const validationInput = Schema.validate({ name, price, productsAvailable, description, idCategory });
        if (validationInput.error) {
            const errorMessages = validationInput.error.details.map((error) => error.message);
            throw new Error(`Dữ liệu không hợp lệ: ${errorMessages.join(', ')}`);
        }

        const imageName = image[0].filename;
        const detailImageNames = [];

        if (detailImages) {
            for (const detailImage of detailImages) {
                detailImageNames.push(detailImage.filename);
            }
        }

        console.log('1:   ', imageName);
        console.log('2:   ', detailImageNames);

        const response = await productService.createProduct({ name, imageName, detailImageNames, price, productsAvailable, description, idCategory });

        return res.status(200).json({
            status: "OK",
            data: response
        });

    } catch (error) {
        return res.status(400).json({
            status: "ERR",
            error: error.message
        });
    }
}

const updateProduct = async (req, res) => {
    try {
        const idProduct = req.params.id;
        const { name, price, productsAvailable, description, idCategory } = req.body;
        const image = req.files.image;
        const detailImages = req.files.detailImages;

        if (!name || !price || !productsAvailable || !description || !idCategory) {
            throw new Error(`Input is required`);
        }

        const validationInput = Schema.validate({ name, price, productsAvailable, description, idCategory });
        if (validationInput.error) {
            const errorMessages = validationInput.error.details.map((error) => error.message);
            throw new Error(`Dữ liệu không hợp lệ: ${errorMessages.join(', ')}`);
        }

        let imageName = null;
        if (image) {
            imageName = image[0].filename;
        }

        const detailImageNames = [];

        if (detailImages) {
            for (const detailImage of detailImages) {
                detailImageNames.push(detailImage.filename);
            }
        }

        console.log('1:   ', imageName);
        console.log('2:   ', detailImageNames);

        const response = await productService.updateProduct({ idProduct, name, imageName, detailImageNames, price, productsAvailable, description, idCategory });

        return res.status(200).json({
            status: "OK",
            data: response
        });

    } catch (error) {
        return res.status(400).json({
            status: "ERR",
            error: error.message
        });
    }
}




const deleteProduct = async (req, res) => {
    try {
        const idProduct = req.params.id;
        if (!idProduct) {
            throw new Error('idProduct is required');
        }

        const response = await productService.deleteProduct(idProduct);
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
    getProduct,
    searchProduct,
    getById,
    createProduct,
    updateProduct,
    deleteProduct
}