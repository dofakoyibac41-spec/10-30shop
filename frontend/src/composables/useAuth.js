// ─── useAuth composable ───────────────────────────────────────────────────────
// Sprint 4: полная реализация авторизации через JWT + localStorage.
// Методы: getToken(), isAuthenticated(), getAuthHeader(), login(), logout().
// Все API-запросы к защищённым эндпоинтам используют getAuthHeader().

export function useAuth() {
  const getToken = () => localStorage.getItem('token');
  const isAuthenticated = () => !!getToken();

  // [DEV-2 Sprint 4] Возвращает заголовок Authorization для защищённых запросов
  const getAuthHeader = () => ({ Authorization: `Bearer ${getToken()}` });

  const login = async (loginVal, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: loginVal, password }),
    });
    if (!res.ok) throw new Error('Неверные учётные данные');
    const { token } = await res.json();
    localStorage.setItem('token', token);
    return token;
  };

  const logout = () => {
    localStorage.removeItem('token');
  };

  return { getToken, isAuthenticated, getAuthHeader, login, logout };
}
