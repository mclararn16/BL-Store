import { Route, Routes } from "react-router-dom";
import Admin from "./pages/Admin";
import Catalogo from "./pages/Catalogo";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Catalogo />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Catalogo />} />
    </Routes>
  );
}
