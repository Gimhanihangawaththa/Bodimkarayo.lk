import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/SignUp.jsx";
import SignIn from "./pages/SignIn.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<SignIn />} />
        
        <Route path="*" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
