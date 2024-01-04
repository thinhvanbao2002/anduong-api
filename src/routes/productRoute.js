import Express from "express";
import upload from "../config/uploads.js";
import productController from "../controllers/productController.js";
import authentication from "../authentication/index.js";

const router = Express.Router();

router.get('/get', productController.getProduct);

router.get('/search', productController.searchProduct);

router.get('/getbyid/:id', productController.getById);

router.get('/getbycategory/:id', productController.getByCategory);

const uploadFields = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'detailImages', maxCount: 4 }
]);
router.post('/create', uploadFields, productController.createProduct);

router.put('/update/:id', uploadFields, productController.updateProduct);

router.put('/updatesoldup/:id', productController.updateProductSoldUp);

router.put('/updateproductvailable/:id', productController.updateProductVailable);

router.delete('/delete/:id', productController.deleteProduct);

router.get('/export', productController.exportExcel);

export default router;