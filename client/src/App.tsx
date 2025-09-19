import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './components/auth/LoginPage'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <LoginPage
              onLogin={() => {
                /* route to dashboard later */
              }}
            />
          }
        />
        {/* redirect root to /login for now */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
