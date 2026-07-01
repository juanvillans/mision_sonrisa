import { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const AuthContext = createContext(null);

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('tokenCasos');
    const userData = localStorage.getItem('userCasos');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    console.log({userData, token});
    localStorage.setItem('tokenCasos', token);
    localStorage.setItem('userCasos', JSON.stringify(userData));
    
    if (localStorage.getItem('tokenCasos')) {
        setUser(userData);
      
    }
  };

  const logout = () => {
    localStorage.removeItem('tokenCasos');
    localStorage.removeItem('userCasos');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
