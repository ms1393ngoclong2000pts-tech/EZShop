import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  }, []);

  useEffect(() => {
    let ignore = false;

    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/?action=auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (ignore) return;

        if (response.ok && data.status === 'success') {
          setUser(data.user);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Lỗi kiểm tra phiên đăng nhập:', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchMe();
    return () => {
      ignore = true;
    };
  }, [token, logout]);

  const login = async (email, password) => {
    const response = await fetch('/api/?action=auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();

    if (!response.ok || data.status === 'error') {
      throw new Error(data.message || 'Đăng nhập thất bại.');
    }

    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const response = await fetch('/api/?action=auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();

    if (!response.ok || data.status === 'error') {
      throw new Error(data.message || 'Đăng ký thất bại.');
    }

    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const refreshUser = async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/?action=auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') setUser(data.user);
    } catch (err) {
      console.error('Lỗi làm mới thông tin người dùng:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
