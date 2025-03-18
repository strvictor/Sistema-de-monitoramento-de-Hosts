import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LoginPage } from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import CreateHost from "./components/CreateHost";
import SettingsPage from "./app/settings/page";

function App() {
  return (
    <div className="flex items-center justify-center min-h-screen min-w-screen">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/login"
            element={
              <LoginPage />
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
          <Route
            path="/settings"
            element={<PrivateRoute element={<SettingsPage />} />}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
