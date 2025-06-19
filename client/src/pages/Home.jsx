  import React from 'react'
  import MainBanner from '../components/MainBanner'
  import Categories from '../components/Categories'
  import BestSeller from '../components/BestSellers'
  import ButtomBanner from '../components/BottomBanner'
  import NewsLetter from '../components/NewsLetter'
  import Recommendations from '../components/Recommendations';

  const Home = () => {
    return (
      <div className='mt-10'>
        <MainBanner/>
        <Categories/>
        <BestSeller/>
        <Recommendations />
        <ButtomBanner/>
        <NewsLetter/>
      </div>
    )
  }

  export default Home