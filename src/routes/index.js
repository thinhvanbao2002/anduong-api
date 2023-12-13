import adminRouter from "./adminRouter.js";
import userRouter from "./userRouter.js";
import productRouter from "./productRoute.js";
import orderRouter from "./orderRouter.js";
import categoryRouter from "./categoryRoute.js";
import voucherRouter from "./voucherRouter.js";
import cartRouter from "./cartRouter.js";
import inventoryRouter from "./inventoryRouter.js";

const routes = (app) => {
    app.use('/api/admin', adminRouter);
    app.use('/api/user', userRouter);
    app.use('/api/product', productRouter);
    app.use('/api/order', orderRouter);
    app.use('/api/category', categoryRouter);
    app.use('/api/voucher', voucherRouter);
    app.use('/api/cart', cartRouter);
    app.use('/api/inventory', inventoryRouter);
}

export default routes;