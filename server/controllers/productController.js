import { v2 as cloudinary } from "cloudinary";
import Product from "../models/product.js";
import fs from 'fs'
// Add Product: /api/product/add
export const addProduct = async (req, res) => {
  try {
    let productData = JSON.parse(req.body.productData);
    const images = req.files;

    if (!images || images.length === 0) {
      return res.status(400).json({ success: false, message: "No images uploaded" });
    }

    let imgagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
          fs.unlink(item.path, (err) => {
          if (err) console.error("Failed to delete local file:", err);
        });
        return result.secure_url
      })
    );
    await Product.create({
      ...productData,
      images: imgagesUrl,
    });
    res.json({
      success: true,
      message: "Product added successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
}

// Get Product: /api/product/list

export const productList = async (req, res) => {
 try {
   const products = await Product.find({});
   res.json({
     success: true,
     products
   })
 } catch (error) {
  console.log(error.message);
   res.json({
     success: false,
     message: error.message
   });
 }
}

// Get single product: /api/product/id
export const productById = async (req, res) => {
  try {
    const { id } = req.body;
    const product = await Product.findById(id);
    res.json({
      success: true,
      product
    })
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
}

// Change product inStock: /api/product/stock
export const changeStock = async (req, res) => {
  try {
     const { id, inStock } = req.body;
     await Product.findByIdAndUpdate(id, { inStock });
     res.json({
       success: true,
       message: "Product stock updated successfully"
     })
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
}
