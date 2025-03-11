import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {LoginPage} from './components/LoginPage';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import CreateHost from './components/CreateHost';

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
          <Route 
            path="/dashboard" 
            element={<PrivateRoute element={<Dashboard />} />} 
          />
          <Route 
            path="/cadastro-host" 
            element={<PrivateRoute element={<CreateHost />} />} 
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
