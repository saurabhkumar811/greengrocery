import React from 'react'
import ProductCard from './ProductCard';
import { useAppContext } from '../context/AppContext'


const BestSeller = () => {
 const {products} = useAppContext();

  return (
    <div className='mt-16' id='best-seller'>
       <p className='text-2xl md:text-3xl font-medium mb-8'>Best Seller</p>
  <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6 mb-16'>
          {products.filter((product) => product.inStock).slice(0,5).map((product, index)=>(
            <ProductCard key={index} product={product} />
          ))}
          
        </div>
    </div>
  )
}

export default BestSeller