import authUser from '../middlewares/authUser.js';
import User from '../models/user.js';
import Product from '../models/product.js';
import express from 'express';

const recommendationRouter = express.Router();

recommendationRouter.get('/personalized', authUser, async (req, res) => {
  try {
    // Defensive: Check user exists
    const user = await User.findById(req.user._id)
      .populate({
        path: 'recentViews',
        model: 'Product'
      });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Defensive: Check recentViews is an array
    const recentViews = Array.isArray(user.recentViews) ? user.recentViews : [];

    const recentProductIds = recentViews.map(p => p._id);
    const categories = [...new Set(recentViews.map(p => p.category).filter(Boolean))];

    let recommendations = [];
    for (const category of categories) {
      const products = await Product.find({
        category,
        _id: { $nin: recentProductIds }
      }).limit(3);
      recommendations.push(...products);
    }

    res.json({ recommendations: recommendations.slice(0, 10) });
  } catch (error) {
    // Log error for debugging
    console.error("Recommendation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default recommendationRouter;
