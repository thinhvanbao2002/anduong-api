import AdminModel from "../models/adminModel.js";
import bcrypt from "bcrypt";

const login = async ({ username, password }) => {
    const existingUser = await AdminModel.findOne({ username });
    if (existingUser) {
        if (existingUser.password != password) {
            throw new Error('Invalid Password');
        } else {
            return existingUser;
        }
    } else {
        throw new Error("User not already");
    }
}

const getPersonnal = async ({ page, perPage }) => {
    const count = await AdminModel.count();
    const data = await AdminModel.find().skip((page - 1) * perPage).limit(perPage);
    if (count === 0 || data.length === 0) {
        throw new Error("Can't get Users");
    }
    const result = { count, data };
    return result;
}

const searchPersonnal = async ({ perPage, page, keyword }) => {
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
                { phone: { $regex: keyword, $options: 'i' } },
            ]
        };
    }

    const count = await AdminModel.countDocuments(getKeyword);
    const data = await AdminModel.find(getKeyword).skip((page - 1) * perPage).limit(perPage);

    if (count === 0 || data.length === 0) {
        throw new Error("Không tìm thấy người dùng nào.");
    }

    const result = { count, data };
    return result;
};

const createPersonnal = async ({ username, email, password, fullName, phone }) => {
    const existingname = await AdminModel.findOne({ username });
    if (existingname) {
        throw new Error("Username already exists");
    }
    const existingEmail = await AdminModel.findOne({ email });
    if (existingEmail) {
        throw new Error("Username already exists");
    }

    const hashPassword = bcrypt.hashSync(password, parseInt(process.env.SALT));
    const createdPersonnal = await AdminModel.create({
        username: username,
        password: hashPassword,
        fullName: fullName,
        email: email,
        phone: phone,
        permission: 2
    })

    createdPersonnal.password = "*****";

    if (!createdPersonnal) {
        throw new Error("Can't create Personnal");
    }
    return createdPersonnal;
}

const updatePersonnal = async ({ idPersonnal, fullName, email, phone }) => {
    console.log({ idPersonnal, fullName, email, phone });

    const existingEmail = await AdminModel.findOne({ email: email, _id: { $ne: idPersonnal } });
    if (existingEmail) {
        throw new Error("Email is already in use by another user");
    }

    const existing = await AdminModel.findById(idPersonnal);
    if (!existing) {
        throw new Error("Personnal doesn't exist");
    }

    existing.fullName = existing.fullName === fullName ? existing.fullName : fullName;
    existing.email = existing.email === email ? existing.email : email;
    existing.phone = existing.phone === phone ? existing.phone : phone;

    const data = await existing.save();
    return data;
}



const deletePersonnal = async ({ idPersonnal }) => {
    const deletedUser = await AdminModel.findByIdAndDelete(idPersonnal);
    if (!deletedUser) {
        throw new Error("Can't delete User");
    }
    return deletedUser;

}


export default {
    login,
    getPersonnal,
    searchPersonnal,
    createPersonnal,
    updatePersonnal,
    deletePersonnal
}