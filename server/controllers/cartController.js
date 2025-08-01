import User from "../models/user.js";

// Update User CartData: /api/cart/update

export const updateCart = async (req, res) => {
  try {
    const {cartItems } = req.body;
    const userId  = req.userId
    await User.findByIdAndUpdate(
      userId,{
        cartItems
      }
    );
    res.json({
      success: true,
      message: "Cart updated successfully",
    });
    
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
}
