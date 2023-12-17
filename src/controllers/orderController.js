import orderService from "../service/orderService.js";
import Joi from "joi";
import ExcelJS from "exceljs";

const Schema = Joi.object({
    idUser: Joi.string().label('idUser'),
    total: Joi.number().label('total'),
});

const getOrder = async (req, res) => {
    try {
        let perPage = parseInt(req.query.perpage) || 10;
        perPage = Math.max(perPage, 5);
        let page = parseInt(req.query.page) || 1;
        page = Math.max(page, 1);

        const response = await orderService.getOrder({ perPage, page });
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

const searchOrder = async (req, res) => {
    try {
        const perPage = 2;
        let keyword = req.query.keyword || "";
        let page = parseInt(req.query.page) || 1;
        page = Math.max(page, 1);

        const response = await orderService.searchOrder({ perPage, keyword, page });
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

const searchOrderByDate = async (req, res) => {
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

        const response = await orderService.searchOrderByDate({ startDate, endDate, page, perPage });
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

const createOrder = async (req, res) => {
    try {
        const { idUser, idVoucher, total, products } = req.body;

        if (!idUser || !total || !products.length) {
            throw new Error("Input is required")
        }

        const validationInput = Schema.validate({ idUser, total });
        if (validationInput.error) {
            const errorMessages = validationInput.error.details.map((error) => error.message);
            throw new Error(`Dữ liệu không hợp lệ: ${errorMessages.join(', ')}`);
        }
        const response = await orderService.createOrder({ idUser, idVoucher, total, products });
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

const updateOrder = async (req, res) => {
    try {
        const idCategory = req.params.id;
        const title = req.body.title;

        if (!title) {
            throw new Error("Input is required")
        }

        const validationInput = Schema.validate({ title });
        if (validationInput.error) {
            const errorMessages = validationInput.error.details.map((error) => error.message);
            throw new Error(`Dữ liệu không hợp lệ: ${errorMessages.join(', ')}`);
        }
        const response = await orderService.updateOrder({ idCategory, title });
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

const deleteOrder = async (req, res) => {
    try {
        const idOrder = req.params.id;
        if (!idOrder) {
            throw new Error('User ID is required');
        }

        const response = await orderService.deleteOrder({ idOrder });

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
        const response = await orderService.exportExcel();

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Danh sách đơn hàng', { properties: { tabColor: { argb: 'FFC0000' } } });

        // Sửa: Loại bỏ dấu || ""
        sheet.columns = [
            { header: "Mã đơn hàng", key: "_id", width: 30 },
            { header: "Họ tên", key: "idUser.fullName", width: 20 },
            { header: "SĐT", key: "idUser.phone", width: 20 },
            { header: "Địa chỉ", key: "idUser.address", width: 50 },
            { header: "Mã voucher", key: "idVoucher.title", width: 30 },
            { header: "Giảm giá (%)", key: "idVoucher.off", width: 12 },
            { header: "Thành tiền", key: "total", width: 10 },
            { header: "Ngày tạo", key: "createdAt", width: 20 },
            { header: "Cập nhật gần đây", key: "updatedAt", width: 20 },
            { header: "Chi tiết đơn hàng", key: "detailOrders", width: 50 },
        ];

        // Thêm dữ liệu vào sheet
        response.forEach(order => {
            const row = {
                _id: order._id,
                "idUser.fullName": order.idUser ? order.idUser.fullName : '',
                "idUser.phone": order.idUser ? order.idUser.phone : '',
                "idUser.address": order.idUser ? order.idUser.address : '',
                "idVoucher.title": order.idVoucher ? order.idVoucher.title : '',
                "idVoucher.off": order.idVoucher ? order.idVoucher.off : '',
                "total": order.total,
                "createdAt": order.createdAt,
                "updatedAt": order.updatedAt,
                "detailOrders": order.detailOrders.map(detailOrder => detailOrder.idProduct.name).join(', ')
            };

            sheet.addRow(row);
        });

        const buffer = await workbook.xlsx.writeBuffer();

        // Set content type, Set header Content-Disposition
        res.setHeader('Content-Disposition', 'attachment; filename=orders_list.xlsx');
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
    getOrder,
    searchOrder,
    searchOrderByDate,
    createOrder,
    updateOrder,
    deleteOrder,
    exportExcel,
}