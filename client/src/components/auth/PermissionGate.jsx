import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const PermissionGate = ({ requiredPermission, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando permisos...</div>;
  }
  console.log({user});

  // Verifica si el usuario existe y si tiene el permiso requerido
  const hasPermission = user && user[requiredPermission] || user.is_admin ;

  if (!hasPermission) {
    // Si no tiene permiso, redirige a una página de inicio o a una de "acceso denegado"
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PermissionGate;