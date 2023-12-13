import express from "express";
import orderController from "../controllers/orderController.js";

const router = express.Router();

router.get('/get', orderController.getOrder);

router.get('/search', orderController.searchOrder);

router.get('/searchbydate', orderController.searchOrderByDate);

router.post('/create', orderController.createOrder);

router.put('/update/:id', orderController.updateOrder);

router.delete('/delete/:id', orderController.deleteOrder);

router.get('/export', orderController.exportExcel);

export default router;
