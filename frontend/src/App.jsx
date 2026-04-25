import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import Home from './pages/Home'
import Properties from './pages/Properties'
import Roommates from './pages/Roommates'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import AddProperty from './pages/AddProperty'
import PropertyView from './pages/PropertyView'
import RoommateView from './pages/RoommateView'
import ProfilePage from './pages/ProfilePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}> 
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="properties" element={<Properties />} />
          <Route path="roommates" element={<Roommates />} />
          <Route path="add-property" element={<AddProperty />} />
          <Route path="edit-property/:propertyId" element={<AddProperty />} />
          <Route path="property/:propertyId" element={<PropertyView />} />
          <Route path="roommate/:roommateId" element={<RoommateView />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="signin" element={<SignIn />} />
          <Route path="signup" element={<SignUp />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
