import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {LoginPage} from './components/LoginPage';
import {Dashboard} from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <div className="flex items-center justify-center min-h-screen min-w-screen">
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={
              <div className="p-6 w-[625px] border-collapse border rounded-lg border-gray-2 bg-[#0A0A0A]">
                <LoginPage />
              </div>
            } 
          />
          {/* Proteger a rota Dashboard */}
          <Route 
            path="/dashboard" 
            element={<PrivateRoute element={<Dashboard />} />} 
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
