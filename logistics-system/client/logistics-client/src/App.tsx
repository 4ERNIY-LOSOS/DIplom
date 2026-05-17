import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, CssBaseline, CircularProgress } from '@mui/material';
import api from './api';
import ClientDashboard from './ClientDashboard';
import AdminPanel from './AdminPanel';
import LogisticianPanel from './LogisticianPanel';
import Profile from './Profile';
import Sidebar from './Sidebar';
import { useAuth } from './AuthContext';
import { VehiclesPage } from './VehiclesPage';
import { DriversPage } from './DriversPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '', email: '', fullName: '', phone: '', password: '', confirmPassword: '',
    companyName: '', taxId: ''
  });
  const navigate = useNavigate();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return alert('Пароли не совпадают!');
    if (!/^[78][0-9]{10}$/.test(formData.phone)) return alert('Телефон должен быть в формате 11 цифр, начиная с 7 или 8');
    setStep(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { password, confirmPassword, ...dataToSubmit } = formData;
      await api.post('/auth/register', { 
        ...dataToSubmit,
        passwordHash: password
      });
      alert('Регистрация успешна!');
      navigate('/');
    } catch (e: any) { alert('Ошибка регистрации: ' + (e.response?.data?.message || e.message)); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (e.target.name === 'phone' || e.target.name === 'taxId') value = value.replace(/[^0-9]/g, '');
    setFormData({ ...formData, [e.target.name]: value });
  };

  return (
    <Container maxWidth="xs">
      <CssBaseline />
      <Box sx={{ mt: 8, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: 'background.paper', boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h5">Регистрация (Шаг {step})</Typography>
        {step === 1 ? (
          <form onSubmit={handleNext} style={{ width: '100%', marginTop: '16px' }}>
            <TextField fullWidth margin="normal" label="ФИО (Фамилия Имя)" name="fullName" value={formData.fullName} onChange={handleChange} required />
            <TextField fullWidth margin="normal" label="Email" type="email" name="email" value={formData.email} onChange={handleChange} required />
            <TextField fullWidth margin="normal" label="Телефон (11 цифр)" name="phone" value={formData.phone} onChange={handleChange} required />
            <TextField fullWidth margin="normal" label="Логин" name="username" value={formData.username} onChange={handleChange} required />
            <TextField fullWidth margin="normal" label="Пароль" type="password" name="password" value={formData.password} onChange={handleChange} required />
            <TextField fullWidth margin="normal" label="Подтверждение пароля" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
            <Button fullWidth variant="contained" type="submit" sx={{ mt: 2 }}>Далее</Button>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={{ width: '100%', marginTop: '16px' }}>
            <TextField fullWidth margin="normal" label="Название компании" name="companyName" value={formData.companyName} onChange={handleChange} required />
            <TextField fullWidth margin="normal" label="ИНН (10-12 цифр)" name="taxId" value={formData.taxId} onChange={handleChange} />
            <Button fullWidth variant="contained" type="submit" sx={{ mt: 2 }}>Завершить</Button>
            <Button fullWidth variant="outlined" sx={{ mt: 1 }} onClick={() => setStep(1)}>Назад</Button>
          </form>
        )}
      </Box>
    </Container>
  );
}

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.role.name === 'client') {
        navigate('/client');
      } else {
        navigate(`/${user.role.name}`);
      }
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { username, password });
      login(response.data.access_token);
    } catch (error) {
      alert('Ошибка входа');
    }
  };

  return (
    <Container maxWidth="xs">
      <CssBaseline />
      <Box sx={{ mt: 8, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: 'background.paper', boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h5">Вход</Typography>
        <form onSubmit={handleLogin} style={{ width: '100%', marginTop: '16px' }}>
          <TextField fullWidth margin="normal" label="Логин" onChange={(e) => setUsername(e.target.value)} />
          <TextField fullWidth margin="normal" label="Пароль" type="password" onChange={(e) => setPassword(e.target.value)} />
          <Button fullWidth variant="contained" type="submit" sx={{ mt: 2 }}>Войти</Button>
          <Button fullWidth variant="text" sx={{ mt: 1 }} onClick={() => navigate('/register')}>Регистрация</Button>
        </form>
      </Box>
    </Container>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logistician" element={<Navigate to="/logistician/orders" replace />} />
        <Route path="/admin" element={<ProtectedRoute><Sidebar><AdminPanel /></Sidebar></ProtectedRoute>} />
        <Route path="/logistician/orders" element={<ProtectedRoute><Sidebar><LogisticianPanel view="orders" /></Sidebar></ProtectedRoute>} />
        <Route path="/logistician/shipments" element={<ProtectedRoute><Sidebar><LogisticianPanel view="shipments" /></Sidebar></ProtectedRoute>} />
        <Route path="/vehicles" element={<ProtectedRoute><Sidebar><VehiclesPage /></Sidebar></ProtectedRoute>} />
        <Route path="/drivers" element={<ProtectedRoute><Sidebar><DriversPage /></Sidebar></ProtectedRoute>} />
        <Route path="/client" element={<ProtectedRoute><Sidebar><ClientDashboard /></Sidebar></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Sidebar><Profile /></Sidebar></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
