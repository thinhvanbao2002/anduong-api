import CategoryModel from "../models/categoryModel.js";
import ProductModel from "../models/productModel.js";

const getCategory = async () => {
  const count = await CategoryModel.count();
  const data = await CategoryModel.find();
  if (count === 0 || data.length === 0) {
    throw new Error("Can't get Product");
  }
  const result = { count, data };
  return result;
}

const searchCategory = async ({ perPage, page, keyword }) => {
  const getKeyword = {
    $or: [ //tìm bản ghi phù hợp ở cả 3 trường dữ liệu
      { title: { $regex: keyword, $options: 'i' } }, //regex: biểu thức tìm chuỗi khớp, option "i": k phân biệt hoa thường
    ]
  };

  const count = await CategoryModel.countDocuments(getKeyword);
  const data = await CategoryModel.find(getKeyword).skip((page - 1) * perPage).limit(perPage);

  if (count === 0 || data.length === 0) {
    throw new Error("Không tìm thấy danh mục nào");
  }

  const result = { count, data };
  return result;
};


const createCategory = async ({ title }) => {
  const createdCategory = await CategoryModel.create({
    title: title,
  });

  if (!createdCategory) {
    throw new Error("Can't create Category");
  }

  return createdCategory;
};


const updateCategory = async ({ idCategory, title }) => {
  const exitstingCategory = await CategoryModel.findById(idCategory);
  if (!exitstingCategory) {
    throw new Error("Can't find Category");
  }

  exitstingCategory.title = title;

  const updatedCategory = await exitstingCategory.save();

  if (!updatedCategory) {
    throw new Error("Can't update Product");
  }

  return updatedCategory;
}


const deleteCategory = async ({ idCategory }) => {
  // Kiểm tra xem có sản phẩm thuộc danh mục này không
  const checkProducts = await ProductModel.findOne({ idCategory });
  if (checkProducts) {
    throw new Error("Cannot delete category because there are products associated with it.");
  }

  // Nếu không có sản phẩm, xóa danh mục
  const deletedCategory = await CategoryModel.findByIdAndDelete(idCategory);

  if (!deletedCategory) {
    throw new Error("Can't delete category");
  }

  return deletedCategory;
};

export default {
  getCategory,
  searchCategory,
  createCategory,
  updateCategory,
  deleteCategory
}