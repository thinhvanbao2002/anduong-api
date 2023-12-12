import orderService from "../service/orderService.js";
import Joi from "joi";

const Schema = Joi.object({
    idUser: Joi.string().label('idUser'),
    total: Joi.number().label('total'),
});

const getOrder = async (req, res) => {
    try {
        const perPage = 2;
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

export default {
    getOrder,
    searchOrder,
    createOrder,
    updateOrder,
    deleteOrder,
}