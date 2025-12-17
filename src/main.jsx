import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>           
      <App />
    </AuthProvider>
  </StrictMode>
)

//namestiš node.js in npm
// npm install (da namestis odvisnosti)
//npm install axios
// npm install -D tailwindcss postcss autoprefixer
// npx tailwindcss init -p
// npm install @heroicons/react
// npm install react-router-dom
// npm run dev
