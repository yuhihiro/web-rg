import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Confirmacao } from './pages/Confirmacao';
import { Sucesso } from './pages/Sucesso';
import { Verificacao } from './pages/Verificacao';
import { Login } from './pages/Admin/Login';
import { Dashboard } from './pages/Admin/Dashboard';
import { AuthProvider, useAuth } from './context/AuthContext';

// Componente para proteger rotas privadas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/confirmacao" element={<Confirmacao />} />
          <Route path="/sucesso" element={<Sucesso />} />
          <Route path="/verificacao/:id" element={<Verificacao />} />
          
          {/* Rotas Administrativas */}
          <Route path="/admin/login" element={<Login />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
