import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { VestiaireProvider } from './context/VestiaireContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <VestiaireProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </VestiaireProvider>
  </React.StrictMode>,
)
