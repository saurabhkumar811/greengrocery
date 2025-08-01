
import jwt from 'jsonwebtoken';
// Login seller : /api/seller/login

export const sellerLogin = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    if(password === process.env.SELLER_PASSWORD && email === process.env.SELLER_EMAIL) {
      const token = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: '7d'});
      res.cookie('sellerToken', token, {
        httpOnly: true,
        secure: true ,
        sameSite:'None',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return res.json({success: true, message: 'Login successful'});
    } else{
      return res.json({success: false, message: 'Invalid credentials'});
    }
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: error.message});
  }
}

// Seller isAuth: /api/seller/is-auth

export const isSellerAuth = async (req, res) => {
  try {
    return res.json({success: true})
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: error.message});
    
  }
}

// Seller logout: /api/seller/logout
export const sellerLogout = async (req, res) => {
  try {
    res.clearCookie('sellerToken',{
      httpOnly: true,
      secure: true,
      sameSite: 'None' ,
    });
    return res.json({success: true, message: 'Logout successful'});
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: error.message});
  }
}

