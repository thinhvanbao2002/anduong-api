import productService from "../service/productService.js";
import Joi from "joi";
import formidable from "formidable";
import path from "path";
import fs from "fs";
import ExcelJS from "exceljs";


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


const getByCategory = async (req, res) => {
    try {
        const idCategory = req.params.id;

        const response = await productService.getProductByCategory({ idCategory });
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
        const { name, unit, price, productsAvailable, description, idCategory } = req.body;
        const image = req.files.image;
        const detailImages = req.files.detailImages;

        if (!name || !image || !unit || !price || !productsAvailable || !description || !idCategory) {
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

        const response = await productService.createProduct({ name, imageName, detailImageNames, unit, price, productsAvailable, description, idCategory });

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
        const { name, unit, price, productsAvailable, description, idCategory } = req.body;
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

        const response = await productService.updateProduct({ idProduct, name, imageName, detailImageNames, unit, price, productsAvailable, description, idCategory });

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

const updateProductSoldUp = async (req, res) => {
    try {
        const idProduct = req.params.id;
        const { amount } = req.body;

        if (!amount) {
            throw new Error(`Input is required`);
        }

        const response = await productService.updateProductSoldUp({ idProduct, amount });

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

const updateProductSoldDown = async (req, res) => {
    try {
        const idProduct = req.params.id;
        const { amount } = req.body;

        if (!amount) {
            throw new Error(`Input is required`);
        }

        const response = await productService.updateProductSoldDown({ idProduct, amount });

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

const exportExcel = async (req, res) => {
    try {
        const response = await productService.exportExcel();

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Danh sách sản phẩm', { properties: { tabColor: { argb: 'FFC0000' } } });

        // Đặt tiêu đề cho các cột
        sheet.columns = [
            { header: "Mã sản phẩm", key: "_id", width: 30 },
            { header: "Tên sản phẩm", key: "name", width: 30 },
            { header: "Danh mục", key: "idCategory.title", width: 30 },
            { header: "Giá", key: "price", width: 20 },
            { header: "Số lượng còn", key: "productsAvailable", width: 20 },
            { header: "Đã bán", key: "sold", width: 20 },
            { header: "Ngày tạo", key: "createdAt", width: 30 },
            { header: "Cập nhật gần đây", key: "updatedAt", width: 30 },
        ];

        // Thêm dữ liệu vào sheet
        response.forEach(product => {
            const row = {
                _id: product._id.toString(),
                name: product.name,
                "idCategory.title": product.idCategory ? product.idCategory.title : '',
                price: product.price.toString(),
                productsAvailable: product.productsAvailable.toString(),
                sold: product.sold.toString(),
                createdAt: product.createdAt.toISOString(),
                updatedAt: product.updatedAt.toISOString(),
            };

            sheet.addRow(row);
        });

        const buffer = await workbook.xlsx.writeBuffer();

        // Set content type, Set header Content-Disposition
        res.setHeader('Content-Disposition', 'attachment; filename=products_list.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        res.send(buffer);
    } catch (error) {
        return res.status(400).json({
            status: "ERR",
            error: error.message
        });
    }
};

export default {
    getProduct,
    searchProduct,
    getById,
    getByCategory,
    createProduct,
    updateProduct,
    updateProductSoldUp,
    updateProductSoldDown,
    deleteProduct,
    exportExcel
}