import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';
import 'dotenv/config';
import userRouter from './routes/userRoute.js';
import sellerRouter from './routes/sellerRoute.js';
import connectCloudinary from './configs/cloudinary.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import orderRouter from './routes/orderRoute.js';
import chatRouter from './routes/chatRoute.js';
import rateLimit from 'express-rate-limit';
import recommendationRoutes from './routes/recommendationRoutes.js';
import { stripeWebhooks } from './controllers/orderController.js';
import path from 'path';

const app = express();
const port = process.env.PORT || 4001;

(async () => {
  await connectDB();
  connectCloudinary();
})();

// ✅ CORS Configuration (Allow credentials & check origin)
const allowedOrigins = [
  'http://localhost:5173',
  'https://greengrocery-iqfr.vercel.app', // your deployed frontend
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // ✅ Send cookies with requests
}));

// ✅ Middleware setup
app.use(express.json());
app.use(cookieParser());

// ✅ Rate Limiting for chat endpoint
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later',
});

// ✅ Static files (uploads)
app.use('/uploads', express.static(path.join(process.cwd(), 'server', 'uploads')));

// ✅ Stripe raw body (must come before express.json if used here)
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// ✅ API Routes
app.use('/api/chat', chatLimiter, chatRouter);
app.use('/api/product', productRouter);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/user', userRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);

// ✅ Root route
app.get('/', (req, res) => res.send('API is Working!'));

// ✅ Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});