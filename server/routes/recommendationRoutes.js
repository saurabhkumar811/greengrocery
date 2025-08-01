import authUser from '../middlewares/authUser.js';
import User from '../models/user.js';
import Product from '../models/product.js';
import express from 'express';

const recommendationRouter = express.Router();

recommendationRouter.get('/personalized', authUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'recentViews',
      model: 'Product',
      match: { category: { $ne: null } }, // Filter out products without category
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const recentViews = user.recentViews || [];
    const recentProductIds = recentViews.map(p => p._id);
    const categories = [...new Set(recentViews.map(p => p.category).filter(Boolean))];

    let recommendations = [];

    // Use Promise.all to fetch recommendations in parallel
    const allRecommendations = await Promise.all(categories.map(category =>
      Product.find({ category, _id: { $nin: recentProductIds } }).limit(3)
    ));

    allRecommendations.forEach(products => {
      recommendations.push(...products);
    });

    res.json({ recommendations: recommendations.slice(0, 10) });
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default recommendationRouter;