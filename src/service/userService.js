import UserModel from "../models/userModel.js";
import UserToken from "../models/userTokenModel.js";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";

const signin = async ({ username, password, fullName, email, userToken }) => {
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
        throw new Error("Username already exists");
    }

    const existingEmail = await UserModel.findOne({ email });
    if (existingEmail) {
        throw new Error("Email already exists");
    }

    const hashPassword = bcrypt.hashSync(password, parseInt(process.env.SALT));
    const createUser = await UserModel.create({
        username: username,
        password: hashPassword,
        fullName: fullName,
        email: email,
        isVerified: false,
        phone: "",
        avt: "src\\files\\images\\avt.jpg",
        address: ""
    })

    createUser.password = "*****";

    const createUserToken = await UserToken.create({
        userID: createUser.id,
        token: userToken
    })

    if (!createUser || !createUserToken) {
        throw new Error("Can't create User");
    }

    console.log(createUser.id, `---`, userToken);
    return createUser;
}

const verifyEmail = async ({ userID, token }) => {
    const existingUser = await UserModel.findById(userID);
    if (!existingUser) {
        throw new Error("User not exists");
    }

    const existingToken = await UserToken.findOne({ userID: existingUser._id, token: token });

    if (!existingToken) {
        throw new Error("Token not exists");
    }

    const decoded = Jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.exp < Date.now() / 1000) {
        throw new Error(`Link has expired`);
    } else {
        existingUser.isVerified = true;
        await existingUser.save();
        await UserToken.findByIdAndRemove(existingToken._id);
        return "OK";
    }
}

const login = async ({ username, password }) => {
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            throw new Error('Invalid Password');
        } if (existingUser.isVerified == false) {
            throw new Error('Email not verify');
        } else {
            return existingUser;
        }
    } else {
        throw new Error("User not already");
    }
}

const getUser = async ({ page, perPage }) => {
    const count = await UserModel.count();
    const data = await UserModel.find().limit(perPage).skip((page - 1) * perPage);
    if (count === 0 || data.length === 0) {
        throw new Error("Can't get Users");
    }
    const result = { count, data };
    return result;
}
const getUserById = async ({ userID }) => {
    const data = await UserModel.findById(userID);
    if (data.length === 0) {
        throw new Error("Can't get Users");
    }
    const result = { data };
    return result;
}

const searchUser = async ({ perPage, page, keyword }) => {
    let getKeyword;

    if (/^[0-9a-fA-F]{24}$/.test(keyword)) {
        // Nếu `keyword` là một chuỗi 24 ký tự hex (điều này phổ biến cho MongoDB ObjectID), sử dụng {_id: keyword}
        getKeyword = { _id: keyword };
    } else {
        // Ngược lại, sử dụng $regex cho các trường còn lại
        getKeyword = {
            $or: [
                { username: { $regex: keyword, $options: 'i' } },
                { fullName: { $regex: keyword, $options: 'i' } },
                { email: { $regex: keyword, $options: 'i' } },
            ]
        };
    }

    const count = await UserModel.countDocuments(getKeyword);
    const data = await UserModel.find(getKeyword).limit(perPage).skip((page - 1) * perPage);

    if (count === 0 || data.length === 0) {
        throw new Error("Không tìm thấy người dùng nào.");
    }

    const result = { count, data };
    return result;
};


const updateAvtUser = async ({ userID, filePath }) => {
    console.log(userID, filePath);
    const existingUser = await UserModel.findById(userID);
    if (!existingUser) {
        throw new Error("User not exists");
    }

    existingUser.avt = filePath;
    const result = await existingUser.save();
    return result;
}

const updateUser = async ({ userID, fullName, address, phone }) => {
    const exitstingUser = await UserModel.findById(userID);
    if (!exitstingUser) {
        throw new Error("User not't exitst");
    }

    exitstingUser.fullName = fullName;
    exitstingUser.address = address;
    exitstingUser.phone = phone;

    const data = await exitstingUser.save();
    return data;
}

const deleteUser = async (userID) => {
    const deletedUser = await UserModel.findByIdAndDelete(userID);
    if (!deletedUser) {
        throw new Error("Can't delete User");
    }
    return deletedUser;
}

export default {
    signin,
    verifyEmail,
    login,
    getUser,
    getUserById,
    searchUser,
    updateAvtUser,
    updateUser,
    deleteUser
}