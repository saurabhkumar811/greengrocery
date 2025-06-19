
import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No Authorized"
    });
  }
  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    if (!tokenDecode.id) {
        return res.status(401).json({
          success: false,
          message: "Invalid Token"
        });
      }

       // Set user object consistently
    req.user = { _id: tokenDecode.id };
    req.userId = tokenDecode.id;
    next();   // execute the controllr fun

  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
}
export default authUser;