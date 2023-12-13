import userService from "../service/userService.js";
import Joi from "joi";
import jwt from "jsonwebtoken";
import formidable from 'formidable';
import path from 'path';
const __dirname = process.cwd();
import mailer from "../utils/mailer.js";
import fs from "fs";
import ExcelJS from "exceljs";


const Schema = Joi.object({
    username: Joi.string().min(3).label('username'),
    email: Joi.string().email().label('email'),
    curentPassword: Joi.string().min(3).label('curentPassword'),
    password: Joi.string().min(3).label('password'),
    confirmPassword: Joi.string().valid(Joi.ref('password')).label('confirmPassword'),
    fullName: Joi.string().label('fullName'),
    phone: Joi.string().pattern(/^[0-9+*. -]+$/).label('phoneNumber'),
    address: Joi.string().label('address'),
});

const getUser = async (req, res) => {
    try {
        const perPage = 3;
        let page = req.query.page || 1;
        page = Math.max(page, 1);
        const response = await userService.getUser({ page, perPage });
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

const getUserById = async (req, res) => {
    try {
        const userID = req.params.id
        const response = await userService.getUserById({ userID });
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

const searchUser = async (req, res) => {
    try {
        const perPage = 3;
        let page = req.query.page || 1;
        page = Math.max(page, 1);
        let keyword = req.query.keyword || "";
        const response = await userService.searchUser({ perPage, page, keyword });
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

const updateUser = async (req, res) => {
    try {
        console.log(req);
        const { fullName, address, phone } = req.body;
        const userID = req.params.id;

        if (!userID || !fullName || !address || !phone) {
            throw new Error("The input is required!");
        }

        const validationInput = Schema.validate({ fullName, address, phone });
        if (validationInput.error) {
            const errorMessages = validationInput.error.details.map((error) => error.message);
            throw new Error(`Dữ liệu không hợp lệ: ${errorMessages.join(', ')}`);
        }

        const response = await userService.updateUser({ userID, fullName, address, phone });

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

const deleteUser = async (req, res) => {
    try {
        const userID = req.params.id;
        if (!userID) {
            throw new Error('User ID is required');
        }

        const response = await userService.deleteUser(userID);

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

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            throw new Error('Username and password are required');
        }

        const validationInput = Schema.validate({ username, password });
        if (validationInput.error) {
            const errorMessages = validationInput.error.details.map((error) => error.message);
            throw new Error(`Dữ liệu không hợp lệ: ${errorMessages.join(', ')}`);
        }

        const response = await userService.login({ username, password });
        response.password = "*****";

        const token = jwt.sign({ data: response }, process.env.JWT_SECRET, { expiresIn: '30 days' })

        return res.status(200).json(
            {
                status: "OK",
                data: response,
                token: token
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
};

const signin = async (req, res) => {
    try {
        const { username, email, password, confirmPassword, fullName } = req.body;
        if (!username || !email || !password || !confirmPassword || !fullName) {
            throw new Error("The input is required!");
        }

        const validationInput = Schema.validate({ username, email, password, confirmPassword, fullName });
        if (validationInput.error) {
            const errorMessages = validationInput.error.details.map((error) => error.message);
            throw new Error(`Dữ liệu không hợp lệ: ${errorMessages.join(', ')}`);
        }

        const subject = "Hello ✔";
        const userToken = jwt.sign({ data: email }, process.env.JWT_SECRET, { expiresIn: '3m' });

        const response = await userService.signin({ username, email, password, confirmPassword, fullName, userToken })

        const html = `Hello ${username},
        Please verify your account by clicking the link:
        http://${req.headers.host}/api/user/acceptverifymail/${response.id}/${userToken}
        Thank You!
        `;

        await mailer(email, subject, html);

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

const updateAvtUser = async (req, res) => {
    try {
        const userID = req.params.id;
        if (!userID) {
            throw new Error('UserID is required');
        }

        const uploadDir = 'uploads/avts'; // Đường dẫn đích cho việc lưu trữ tệp
        const form = formidable({
            uploadDir: uploadDir,
            keepExtensions: true, // Giữ cả đuôi của tệp
            maxFileSize: 1 * 1024 * 1024, // Kích thước tối đa là 1MB
            maxFiles: 1,
        });

        form.parse(req, async (err, fields, files) => {
            try {
                if (err) {
                    throw new Error("Không thể tải lên hình ảnh: " + err.message);
                }
                const uploadedFile = files.avatar;
                if (!uploadedFile) {
                    throw new Error("Không có tệp hình ảnh được tải lên.");
                }

                const fileMimeType = files.avatar[0].mimetype;
                const newFilename = uploadedFile[0].newFilename;
                const filePath = path.join('/avts', newFilename);
                if (fileMimeType.startsWith('image/')) {
                    const response = await userService.updateAvtUser({ userID, filePath });
                    return res.status(200).json(
                        {
                            status: "OK",
                            data: response
                        }
                    )
                } else {
                    fs.unlink(filePath, (unlinkError) => {
                        if (unlinkError) {
                            throw new Error("Error deleting file:", unlinkError);
                        }
                    });
                    throw new Error('File not type image');
                }
            } catch (error) {
                return res.status(400).json(
                    {
                        status: "ERR",
                        error: error.message
                    }
                )
            }
        });
    } catch (error) {
        return res.status(400).json(
            {
                status: "ERR",
                error: error.message
            }
        )
    }
};

const verifyEmail = async (req, res) => {
    try {
        const userID = req.params.id;
        const token = req.params.token;

        const response = await userService.verifyEmail({ userID, token });
        if (response === "OK") {
            const successMessage = `
                <div style="text-align: center; padding: 20px; background-color: #dff0d8; color: #3c763d; border: 1px solid #d6e9c6; border-radius: 5px;">
                    <h1>Email verified successfully</h1>
                    <p>Please <a href="http://localhost:3000/">login</a> to continue.</p>
                </div>`;
            res.send(successMessage);
        }

    } catch (error) {
        const errorMessage = '<div style="text-align: center; padding: 20px; background-color: #f2dede; color: #a94442; border: 1px solid #ebccd1; border-radius: 5px;"><h1>Email verification failed</h1></div>';
        res.send(errorMessage);
    }
}

const exportExcel = async (req, res) => {
    try {
        const response = await userService.exportExcel();
        console.log(response);

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Danh sách khách hàng', { properties: { tabColor: { argb: 'FFC0000' } } });

        // Sửa: Loại bỏ dấu || ""
        sheet.columns = [
            { header: "Mã khách", key: "id", width: 30 },
            { header: "Username", key: "username", width: 30 },
            { header: "Họ tên", key: "fullName", width: 30 },
            { header: "Email", key: "email", width: 30 },
            { header: "SĐT", key: "phone", width: 20 },
            { header: "Địa chỉ", key: "address", width: 50 },
        ];

        sheet.addRows(response);

        const buffer = await workbook.xlsx.writeBuffer();

        // Set content type, Set header Content-Disposition
        res.setHeader('Content-Disposition', 'attachment; filename=users_list.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        res.send(buffer);

        // Không cần return trước khi gửi phản hồi
        // res.status(200).json({
        //     status: "OK",
        //     data: response
        // });
    } catch (error) {
        return message.MESSAGE_ERROR(res, 'ERR', error.message)
    }
};

export default {
    getUser,
    getUserById,
    searchUser,
    updateUser,
    deleteUser,
    login,
    signin,
    updateAvtUser,
    verifyEmail,
    exportExcel
}