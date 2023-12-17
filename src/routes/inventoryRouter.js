import Express from "express";
import inventoryController from "../controllers/inventoryController.js";
import authentication from "../authentication/index.js";

const router = Express.Router();

router.get('/get', inventoryController.getInventory);

router.get('/search', inventoryController.searchInventory);

router.get('/getbyid/:id', inventoryController.getById);

router.get('/searchbydate', inventoryController.getInventoryByDate);

router.post('/create', inventoryController.createInventory);

router.delete('/delete/:id', inventoryController.deleteInventory);

router.get('/export', inventoryController.exportExcel);

export default router;