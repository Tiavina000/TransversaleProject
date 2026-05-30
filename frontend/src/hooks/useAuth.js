import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('eneni_token');
    if (token) {
      authAPI.me()
        .then((res) => setUser(res.data))
        .catch(() => {
          sessionStorage.removeItem('eneni_token');
          sessionStorage.removeItem('eneni_refresh');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return { user, loading };
}
