import { createSignal, createContext, useContext } from 'solid-js';

const AuthContext = createContext();

export function AuthProvider(props) {
  const [user, setUser] = createSignal(null);
  const [isAuthenticated, setIsAuthenticated] = createSignal(false);

  const login = async (email, password) => {
    // TODO: Conectar con API Gateway Rust (puerto 3009)
    // const response = await fetch('http://localhost:3009/api/auth/login', { ... });
    setUser({ name: 'Admin User', email });
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const auth = { user, isAuthenticated, login, logout };

  return (
    <AuthContext.Provider value={auth}>
      {props.children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
