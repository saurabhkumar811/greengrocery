import React from 'react'
import MainBanner from '../components/MainBanner'
import Categories from '../components/Categories'
import BestSellers from '../components/BestSellers'

function Home() {
  return (
    <div className='mt-10'>
      <MainBanner/>
      <Categories/>
      <BestSellers/>
    </div>
  )
}

export default Home
