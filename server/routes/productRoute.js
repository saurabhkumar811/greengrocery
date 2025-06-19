import express from 'express';
import { upload } from '../configs/multer.js';
import authSeller from '../middlewares/authSeller.js';
import { addProduct, changeStock, productById, productList } from '../controllers/productController.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import authUser from '../middlewares/authUser.js';

const productRouter = express.Router();

// productRouter.post('/add', upload.array([images]), authSeller, addProduct);
productRouter.post('/add', upload.array('images'), authSeller, addProduct);

productRouter.get('/list', productList);
productRouter.get('/id', productById);
productRouter.post('/stock', authSeller,changeStock)


// Updated product/:id route
productRouter.get('/product/:id', authUser, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (req.user) {
    const user = await User.findById(req.user._id);
    let recentViews = user.recentViews || [];

    // Remove if already present
    const idx = recentViews.findIndex(id => id.equals(product._id));
    if (idx !== -1) recentViews.splice(idx, 1);

    // Add to end
    recentViews.push(product._id);

    // Keep only last 5
    if (recentViews.length > 5) recentViews = recentViews.slice(-5);

    user.recentViews = recentViews;
    await user.save();
  }
  res.json(product);
});



export default productRouter;