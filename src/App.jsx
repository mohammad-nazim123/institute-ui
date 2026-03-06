import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './components/Dashboard';
import AdminPage from './components/AdminPage';
import StudentPage from './components/StudentPage';
import ProfessorPage from './components/ProfessorPage';
import './App.css';
import { getToken, getStudentId, getProfessorId, getAdminKey } from './utils/storage';

// ─── Auth state is resolved async because storage is encrypted ───────────────
function useAuthState() {
  const [authState, setAuthState] = useState(null); // null = loading

  useEffect(() => {
    let cancelled = false;

    // Keys to clear if decryption fails (leftover plain-text from old version)
    const SENSITIVE_KEYS = [
      'my_token', 'my_refresh_token', 'admin_unique_and_secure_id',
      'institute', 'student', 'student_unique_id',
      'professor', 'professor_id', 'professor_key'
    ];

    Promise.all([getToken(), getStudentId(), getProfessorId(), getAdminKey()])
      .then(([token, studentId, professorId, adminKey]) => {
        // If token is present in localStorage but decrypted to null, it's
        // a stale plain-text entry — clear it so the login page shows up.
        if (!token && localStorage.getItem('my_token')) {
          SENSITIVE_KEYS.forEach(k => localStorage.removeItem(k));
        }
        if (!cancelled) {
          setAuthState({ token, studentId, professorId, adminKey });
        }
      })
      .catch(() => {
        if (!cancelled) setAuthState({ token: null, studentId: null, professorId: null, adminKey: null });
      });

    return () => { cancelled = true; };
  }, []);

  return authState;
}

function App() {
  const authState = useAuthState();

  // Show nothing (or a tiny spinner) while decrypting from localStorage
  if (authState === null) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#f8f9fc',
        fontFamily: 'Inter, sans-serif', color: '#667eea', fontSize: '1rem'
      }}>
        Loading…
      </div>
    );
  }

  const { token, studentId, professorId, adminKey } = authState;
  const isAuth = !!token;

  const PrivateRoute = ({ children }) =>
    isAuth ? children : <Navigate to="/" replace />;

  const PublicRoute = ({ children }) => {
    if (isAuth) {
      if (studentId)   return <Navigate to="/student"   replace />;
      if (professorId) return <Navigate to="/professor" replace />;
      if (adminKey)    return <Navigate to="/admin"     replace />;
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/"          element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup"    element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/admin"     element={<PrivateRoute><AdminPage /></PrivateRoute>} />
        <Route path="/student"   element={<PrivateRoute><StudentPage /></PrivateRoute>} />
        <Route path="/professor" element={<PrivateRoute><ProfessorPage /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
