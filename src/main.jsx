import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import RestaurantPOS from './BILLING/Restaurantpos.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RestaurantPOS />
  </StrictMode>,
)
