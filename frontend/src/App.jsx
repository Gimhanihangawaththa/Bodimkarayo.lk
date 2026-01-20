import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AddProperty from "./pages/AddProperty.jsx";
import PropertyView from "./pages/PropertyView.jsx";
import GivePage from "./pages/GivePage.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/add-property" element={<AddProperty />} />
        {/* <Route path="/AddProperty" element={<AddProperty />} /> */}
        <Route path="/property/:propertyId" element={<PropertyView />} />
        <Route path="/" element={<AddProperty />} />
         <Route path="/give" element={<GivePage />} />


        <Route path="*" element={<AddProperty />} />
      </Routes>
    </Router>
  );
}

export default App;
