import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe, { Stripe } from "stripe";
import User from "../models/user.js";
import mongoose from "mongoose";

// Place Order COD: /api/order/COD

export const placeOrderCOD = async (req, res) => {
  try {
    const { items, address} = req.body;
    const  userId =  req.userId;
    if(!address || !Array.isArray(items) || items.length === 0){
      return res.json({
        success: false,
        message: "Please add address and items to place order"
      })
    }

  // Convert IDs to ObjectId
    const addressId = new mongoose.Types.ObjectId(address);
    const itemsWithObjectIds = items.map(item => ({
      product: new mongoose.Types.ObjectId(item.product),
      quantity: item.quantity
    }));

    // Calculate Amount Using Items
    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
     if (!product) {
       throw new Error(`Product with ID ${item.product} not found`);
      }
      return (await acc) + (product.offerPrice * item.quantity);
    }, 0);

    // Add Tax Charges (2%)

    amount += Math.floor(amount * 0.02);

    await Order.create({
      userId,
      items : itemsWithObjectIds,
      amount,
      address : addressId,
      paymentType: "COD",
     
    });
    return res.json({
      success: true,
      message: "Order placed successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
}


// Place Order Stripe: /api/order/stripe
export const placeOrderStripe = async (req, res) => {
  try {
    const { items, address, amount} = req.body;
    const userId = req.userId ;
    const {origin} = req.headers;
    if(!address || items.length === 0){
      return res.json({
        success: false,
        message: "Invalid data"
      })
    }

  // Convert IDs to ObjectId
    const addressId = new mongoose.Types.ObjectId(address);
    const itemsWithObjectIds = items.map(item => ({
      product: new mongoose.Types.ObjectId(item.product),
      quantity: item.quantity
    }));

    let productData = [];

    // Calculate Amount Using Items
    let totalAmount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity
      });
      return (await acc) + (product.offerPrice * item.quantity);
    }
    , 0);
    // Add Tax Charges (2%)
     totalAmount += Math.floor(totalAmount * 0.02);

    const order = await Order.create({
      userId,
      items : itemsWithObjectIds,
      amount : totalAmount ,
      address : addressId ,
      paymentType: "Online",
    });


    // Stripe Getway Initialization
    const stripeInstance = Stripe(process.env.STRIPE_SECRET_KEY);

    // Create line items for stripe

    const line_items = productData.map((item) => {
     
     if (typeof item.price !== "number" || isNaN(item.price)) {
        throw new Error("Invalid price for Stripe payment");
      } 
      
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.floor((item.price + item.price * 0.02) * 100) ,
        },
        quantity: item.quantity,
      }
    })

    // Create Checkout Session
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: `${origin}/loader?next=my-orders/${order._id}`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });

    return res.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
}

// Stripe Webhooks to Verify Payments Action : /stripe
export const stripeWebhooks = async (request, response) => {
    // Stripe Gateway Initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const sig = request.headers["stripe-signature"];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        response.status(400).send(`Webhook Error: ${error.message}`);
    }

    // Handle the event
    switch (event.type) {
        case "payment_intent.succeeded": {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            // Getting Session Metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            const { orderId, userId } = session.data[0].metadata;
            // Mark Payment as Paid
            await Order.findByIdAndUpdate(orderId, { isPaid: true });
            // Clear user cart
            await User.findByIdAndUpdate(userId, { cartItems: {} });
            break;
        }
        case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            // Getting Session Metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

              const { orderId } = session.data[0].metadata;
              await Order.findByIdAndDelete(orderId);
              break;
    }

    default:
        console.error(`Unhandled event type ${event.type}`)
        break;
}
response.json({received: true})
}


// Get Orders by User ID: /api/order/user

export const getUserOrders = async (req, res) => {
  try {
    const  userId  = req.userId;
    const orders = await Order.find({
      userId,
      $or:[{paymentType: "COD"}, {ispaid: true}]
    }).populate("items.product address").sort({createdAt: -1});
     res.json({
      success: true,
      orders
    });
  } catch (error) {
     res.json({
      success: false,
      message: error.message,
    });
  }
}


// Get All Orders (for seller / admin): /api/order/all

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find(
      {$or:[{paymentType: "COD"}, {isPaid: true}]}
    ).populate("items.product address").sort({createdAt: -1});
    res.json({
      success: true,
      orders
    });
  } catch (error) {
     res.json({
      success: false,
      message: error.message,
    });
  }
}