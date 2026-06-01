import { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box, CssBaseline } from '@mui/material';
import api from './api';
import { useNavigate } from 'react-router-dom';

export function PasswordReset() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaData, setCaptchaData] = useState<{ question: string, id: string } | null>(null);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [serverCode, setServerCode] = useState(''); 
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 1) {
      api.post('/auth/password-reset/captcha').then(res => setCaptchaData(res.data));
    }
  }, [step]);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaData) return;
    try {
      const response = await api.post('/auth/password-reset/request', { 
        username, 
        captchaId: captchaData.id, 
        captchaAnswer: parseInt(captchaAnswer) 
      });
      setServerCode(response.data.code);
      setStep(2);
    } catch (e) { alert('Ошибка: неверная капча или пользователь не найден'); }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/password-reset/confirm', { code, newPassword });
      alert('Пароль успешно изменен!');
      navigate('/');
    } catch (e) { alert('Ошибка: неверный код'); }
  };

  return (
    <Container maxWidth="xs">
      <CssBaseline />
      <Box sx={{ mt: 8, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: 'background.paper', boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h5">Восстановление пароля</Typography>
        {step === 1 ? (
          <form onSubmit={handleRequest} style={{ width: '100%', marginTop: '16px' }}>
            <TextField fullWidth margin="normal" label="Логин" onChange={(e) => setUsername(e.target.value)} required />
            {captchaData && (
              <TextField fullWidth margin="normal" label={`Сколько будет: ${captchaData.question}?`} onChange={(e) => setCaptchaAnswer(e.target.value)} required />
            )}
            <Button fullWidth variant="contained" type="submit" sx={{ mt: 2 }}>Получить код</Button>
          </form>
        ) : (
          <form onSubmit={handleConfirm} style={{ width: '100%', marginTop: '16px' }}>
            <Typography color="primary" sx={{ mb: 2 }}>Ваш код: <b>{serverCode}</b></Typography>
            <TextField fullWidth margin="normal" label="Введите код" onChange={(e) => setCode(e.target.value)} required />
            <TextField fullWidth margin="normal" label="Новый пароль" type="password" onChange={(e) => setNewPassword(e.target.value)} required />
            <Button fullWidth variant="contained" type="submit" sx={{ mt: 2 }}>Сменить пароль</Button>
          </form>
        )}
        <Button fullWidth variant="text" sx={{ mt: 1 }} onClick={() => navigate('/')}>Назад ко входу</Button>
      </Box>
    </Container>
  );
}
