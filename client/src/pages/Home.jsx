import React from 'react'
import MainBanner from '../components/MainBanner'
import Categories from '../components/Categories'
import BestSeller from '../components/BestSellers'
import ButtomBanner from '../components/BottomBanner'
import NewsLetter from '../components/NewsLetter'

const Home = () => {
  return (
    <div className='mt-10'>
       <MainBanner/>
       <Categories/>
       <BestSeller/>
       <ButtomBanner/>
       <NewsLetter/>
    </div>
  )
}

export default Home