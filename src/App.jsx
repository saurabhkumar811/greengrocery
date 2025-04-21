import React from 'react'
import Navbar from './components/NavBar'
import { Routes , Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import { Toaster } from 'react-hot-toast'
import Footer from './components/Footer'
import { useAppContext } from './context/AppContext'
import Login from './components/Login'


const App = () => {

   const isSellerPath = useLocation().pathname.includes("seller")
   const { showUserLogin} = useAppContext()

  return (
    <div>

     <Toaster/>

      { isSellerPath ? null : <Navbar/>}
      { showUserLogin ? <Login/> : null }   

      <div  className={`${isSellerPath ? ""  : "px-6 md:px-16 lg:px-24 xl:px-32" }` }>
        <Routes>
          <Route  path='/' element={<Home/>} />
        </Routes>
      </div>

      { isSellerPath ? null:<Footer/> }
    </div>
  )
}

export default App
