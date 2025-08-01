import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

axios.defaults.withCredentials = true;

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState({});

  // Fetch User Auth
  const fetchUser = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/is-auth`);
      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cartItems || {});
      }
    } catch (error) {
      setUser(null);
    }
  };

  // Fetch Seller Auth
  const fetchSeller = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/seller/is-auth`);
      setIsSeller(data.success);
    } catch (error) {
      setIsSeller(false);
    }
  };

  // Fetch All Products
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/product/list`);
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Add Product to Cart
  const addToCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId] = (cartData[itemId] || 0) + 1;
    setCartItems(cartData);
    toast.success("Added to Cart");
  };

  // Update Cart Item Quantity
  const updateCartItem = (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId] = quantity;
    setCartItems(cartData);
    toast.success("Cart Updated");
  };

  // Remove Product from Cart
  const removeFromCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] -= 1;
      if (cartData[itemId] <= 0) {
        delete cartData[itemId];
      }
    }
    setCartItems(cartData);
    toast.success("Removed from Cart");
  };

  // Get Cart Item Count
  const getCartCount = () => {
    return Object.values(cartItems).reduce((a, b) => a + b, 0);
  };

  // Get Cart Total Amount
  const getCartAmount = () => {
    let total = 0;
    for (const itemId in cartItems) {
      const item = products.find(p => p._id === itemId);
      if (item) {
        total += item.offerPrice * cartItems[itemId];
      }
    }
    return Math.floor(total * 100) / 100;
  };

  // Fetch initial data on mount
  useEffect(() => {
    fetchUser();
    fetchSeller();
    fetchProducts();
  }, []);

  // Sync cart with backend
  useEffect(() => {
    const updateCart = async () => {
      try {
        const { data } = await axios.post(`${backendUrl}/api/cart/update`, { cartItems });
        if (!data.success) toast.error(data.message);
      } catch (error) {
        toast.error(error.message);
      }
    };
    if (user) updateCart();
  }, [cartItems]);

  // Clean up cart if products get removed
  useEffect(() => {
    if (!products.length) return;
    const validIds = products.map(p => p._id);
    const updatedCart = {};
    let changed = false;
    for (const id in cartItems) {
      if (validIds.includes(id)) {
        updatedCart[id] = cartItems[id];
      } else {
        changed = true;
      }
    }
    if (changed) {
      setCartItems(updatedCart);
      toast.error("Some products were removed from your cart.");
    }
  }, [products]);

  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    showUserLogin,
    setShowUserLogin,
    products,
    currency,
    addToCart,
    updateCartItem,
    removeFromCart,
    cartItems,
    searchQuery,
    setSearchQuery,
    getCartCount,
    getCartAmount,
    axios,
    fetchProducts,
    setCartItems
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
