import express from "express";
import categoryController from "../controllers/categoryController.js";
import authentication from "../authentication/index.js";

const router = express.Router();

router.get('/get', categoryController.getCategory);

router.get('/search', categoryController.searchCategory);

router.post('/create',categoryController.createCategory);

router.put('/update/:id', categoryController.updateCategory);

router.delete('/delete/:id', categoryController.deleteCategory);

export default router;
