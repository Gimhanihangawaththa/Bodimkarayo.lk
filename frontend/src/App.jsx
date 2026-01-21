import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import WithoutLogin from './pages/WithoutLogin'
import Home from './pages/Home'
import Properties from './pages/Properties'
import Roommates from './pages/Roommates'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}> 
          <Route index element={<WithoutLogin />} />
          <Route path="home" element={<Home />} />
          <Route path="properties" element={<Properties />} />
          <Route path="roommates" element={<Roommates />} />
          <Route path="signin" element={<SignIn />} />
          <Route path="signup" element={<SignUp />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
