import { getAllOrders, getUserOrders, placeOrderCOD } from "../controllers/orderConroller.js"
import express from 'express'
import authUser from "../middlewares/authUser.js"

const  orderRouter =  express.Router()

orderRouter.post('/cod', authUser,  placeOrderCOD)
orderRouter.post('/user', authUser,  getUserOrders)
orderRouter.post('/seller', authUser,  getAllOrders)

export default  orderRouter 