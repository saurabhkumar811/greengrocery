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
  import path from 'path'



  const app = express();
  const port = process.env.PORT || 4001;


  (async () => {
    await connectDB();
    connectCloudinary();
  })();

  const chatLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per window
    message: "Too many requests from this IP, please try again later"
  });


  // for ai chat assistance 
  app.use('/api/chat', chatLimiter, chatRouter);


  // Serve static files from 'uploads' directory
  app.use('/uploads' , express.static(path.join(process.cwd(),'server', 'uploads')))

  app.use('/api/chat', chatRouter);

  // Allow multiple origins
  const allowdOrigins = [
    'http://localhost:5173' ,'https://greengrocery-ashy.vercel.app/']

  app.post('/stripe', express.raw({type : 'application/json'}),stripeWebhooks)


  // Midldleware configuration
  app.use(express.json());
  app.use(cookieParser());
  app.use(cors({origin: allowdOrigins, credentials: true}));
  app.get('/', (req, res) => res.send('API is Working!'));
  app.use('/api/product', productRouter)
  app.use('/api/recommendations', recommendationRoutes);
  app.use('/api/user', userRouter)
  app.use('/api/seller', sellerRouter)
  app.use('/api/cart', cartRouter)
  app.use('/api/address', addressRouter)
  app.use('/api/order', orderRouter)

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });