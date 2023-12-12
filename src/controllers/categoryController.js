import categoryService from "../service/categoryService.js";
import Joi from "joi";
import jwt from "jsonwebtoken";
import formidable from 'formidable';
import path from 'path';
const __dirname = process.cwd();
import mailer from "../utils/mailer.js";
import fs from "fs";

const Schema = Joi.object({
    title: Joi.string().label('title'),
});

const getCategory = async (req, res) => {
    try {
        const response = await categoryService.getCategory();
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

const searchCategory = async (req, res) => {
    try {
        const perPage = 3;
        let page = req.query.page || 1;
        page = Math.max(page, 1);
        let keyword = req.query.keyword || "";
        const response = await categoryService.searchCategory({ perPage, page, keyword });
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

const createCategory = async (req, res) => {
    try {
        const title = req.body.title;

        if (!title) {
            throw new Error("Input is required")
        }

        const validationInput = Schema.validate({ title });
        if (validationInput.error) {
            const errorMessages = validationInput.error.details.map((error) => error.message);
            throw new Error(`Dữ liệu không hợp lệ: ${errorMessages.join(', ')}`);
        }
        const response = await categoryService.createCategory({ title });
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

const updateCategory = async (req, res) => {
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
        const response = await categoryService.updateCategory({ idCategory, title });
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

const deleteCategory = async (req, res) => {
    try {
        const idCategory = req.params.id;
        if (!idCategory) {
            throw new Error('User ID is required');
        }

        const response = await categoryService.deleteCategory({ idCategory });

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
    getCategory,
    searchCategory,
    createCategory,
    updateCategory,
    deleteCategory,
}