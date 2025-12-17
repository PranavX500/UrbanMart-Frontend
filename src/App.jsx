import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Login from './components/Login'
import Signup from './components/Signup'
import Otp from './components/Otp'
import ProductPage from './components/ProductPage'
import ProductDetail from './components/ProductDetail'
import Dashboard from "./components/Dashboard";
import OrderSummary from './components/OrderSummary'
import CartPage from "./components/CartPage";   // ✅ ADD THIS
import OrdersPage from './components/OrdersPage'

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Dashboard/>
        <Routes>
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/otp" element={<Otp />} />
          <Route path="/" element={<ProductPage />} />
          <Route path="/order-summary" element={<OrderSummary />} />
           <Route path="/orders" element={<OrdersPage />} />



          {/* ✅ ADD CART ROUTE */}
          <Route path="/cart" element={<CartPage />} />

          {/* Default */}
          <Route path="*" element={<Navigate to="/" replace />} />
          
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
