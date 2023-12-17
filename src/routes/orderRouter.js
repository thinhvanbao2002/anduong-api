import express from "express";
import orderController from "../controllers/orderController.js";

const router = express.Router();

router.get('/get', orderController.getOrder);

router.get('/search', orderController.searchOrder); // truyền theo query, search theo id user hoặc id order

router.get('/searchbydate', orderController.searchOrderByDate); // truyền startdate enddate page perpage vào query

router.post('/create', orderController.createOrder);

router.put('/update/:id', orderController.updateOrder);

router.delete('/delete/:id', orderController.deleteOrder);

router.get('/export', orderController.exportExcel);

export default router;
