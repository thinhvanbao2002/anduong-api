import inventoryService from "../service/inventoryService.js";
import Joi from "joi";
import ExcelJS from "exceljs";


const Schema = Joi.object().keys({
    amount: Joi.number().label('amount'),
    price: Joi.number().label('price'),
});

const getInventory = async (req, res) => {
    try {
        const perPage = 2;
        let page = parseInt(req.query.page) || 1;
        page = Math.max(page, 1);
        const response = await inventoryService.getInventory(page, perPage);
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

const searchInventory = async (req, res) => {
    try {
        const perPage = 2;
        let keyword = req.query.keyword || "";
        let page = parseInt(req.query.page) || 1;
        page = Math.max(page, 1);

        const response = await inventoryService.searchInventory({ perPage, keyword, page });
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
        const idInventory = req.params.id;

        const response = await inventoryService.getInventoryById({ idInventory });
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

const getInventoryByDate = async (req, res) => {
    try {
        let startDate = req.query.startdate;
        let endDate = req.query.enddate;
        let perPage = parseInt(req.query.perpage) || 3;
        // perPage = Math.max(perPage, 3);
        let page = parseInt(req.query.page) || 1;
        page = Math.max(page, 1);

        if (!startDate || !endDate) {
            throw new Error("Invalid date range");
        }

        const response = await inventoryService.getInventoryByDate({ startDate, endDate, page, perPage });
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

const createInventory = async (req, res) => {
    try {
        const { idAdmin, idProduct, amount, price, description } = req.body;

        if (!idAdmin || !idProduct || !amount || !price || !description) {
            throw new Error(`Input is required`);
        }

        const validationInput = Schema.validate({ amount, price });
        if (validationInput.error) {
            const errorMessages = validationInput.error.details.map((error) => error.message);
            throw new Error(`Dữ liệu không hợp lệ: ${errorMessages.join(', ')}`);
        }

        const response = await inventoryService.createInventory({ idAdmin, idProduct, amount, price, description });

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

const updateInventory = async (req, res) => {
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

        const response = await inventoryService.updateProduct({ idProduct, name, imageName, detailImageNames, unit, price, productsAvailable, description, idCategory });

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

const deleteInventory = async (req, res) => {
    try {
        const idProduct = req.params.id;
        if (!idProduct) {
            throw new Error('idProduct is required');
        }

        const response = await inventoryService.deleteProduct(idProduct);
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
        const response = await inventoryService.exportExcel();

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
    getInventory,
    searchInventory,
    getById,
    getInventoryByDate,
    createInventory,
    updateInventory,
    deleteInventory,
    exportExcel
}