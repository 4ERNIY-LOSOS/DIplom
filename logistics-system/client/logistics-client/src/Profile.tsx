import { useEffect, useState } from 'react';
import api from './api';
import { Container, Typography, TextField, Button, Box, Paper, Divider } from '@mui/material';
import { useAuth } from './AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [formData, setFormData] = useState({ 
    fullName: '', email: '', phone: '', username: '', 
    oldPassword: '', newPassword: '', confirmNewPassword: '',
    companyName: '', taxId: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        username: user.username || '',
        oldPassword: '', newPassword: '', confirmNewPassword: '',
        companyName: user.company?.name || '',
        taxId: user.company?.taxId || ''
      });
    }
  }, [user]);

  const validate = () => {
    const newErrors: any = {};
    if (!formData.fullName) newErrors.fullName = 'ФИО обязательно';
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Некорректный email';
    if (!formData.phone || !/^[78][0-9]{10}$/.test(formData.phone)) newErrors.phone = '11 цифр, начиная с 7 или 8';
    if (!formData.username) newErrors.username = 'Логин обязателен';
    
    if (formData.newPassword) {
      if (!formData.oldPassword) newErrors.oldPassword = 'Для смены пароля нужен старый пароль';
      if (formData.newPassword.length < 3) newErrors.newPassword = 'Минимум 3 символа';
      if (formData.newPassword !== formData.confirmNewPassword) newErrors.confirmNewPassword = 'Пароли не совпадают';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let sanitizedValue = value;
    if (name === 'phone' || name === 'taxId') sanitizedValue = value.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    if (errors[name]) {
      setErrors((prev: any) => { const next = { ...prev }; delete next[name]; return next; });
    }
  };

  const handleUpdate = async () => {
    if (!validate() || !user) return;
    try {
      const payload: any = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        username: formData.username
      };
      if (formData.newPassword) {
        payload.oldPassword = formData.oldPassword;
        payload.newPassword = formData.newPassword;
        payload.confirmNewPassword = formData.confirmNewPassword;
      }
      if (formData.companyName) {
        payload.companyName = formData.companyName;
        payload.taxId = formData.taxId;
      }
      await api.patch(`/users/${user.id}`, payload);
      setIsEditing(false);
      alert('Данные успешно обновлены');
      window.location.reload(); // Принудительное обновление для синхронизации
    } catch (e: any) {
      alert(e.response?.data?.message || 'Ошибка обновления');
    }
  };

  if (!user) return <Container sx={{ mt: 4 }}><Typography>Загрузка...</Typography></Container>;

  return (
    <Paper sx={{ p: 4, borderRadius: 2 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Личный кабинет</Typography>
      
      {!isEditing ? (
        <Box>
          <Typography sx={{ mb: 1 }}><strong>ФИО:</strong> {user.fullName || 'Не указано'}</Typography>
          <Typography sx={{ mb: 1 }}><strong>Email:</strong> {user.email || 'Не указано'}</Typography>
          <Typography sx={{ mb: 1 }}><strong>Телефон:</strong> {user.phone || 'Не указано'}</Typography>
          <Typography sx={{ mb: 1 }}><strong>Логин:</strong> {user.username}</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography sx={{ mb: 1 }}><strong>Компания:</strong> {user.company?.name || 'Не указана'}</Typography>
          <Typography sx={{ mb: 1 }}><strong>ИНН:</strong> {user.company?.taxId || 'Не указано'}</Typography>
          <Button variant="contained" onClick={() => setIsEditing(true)} sx={{ mt: 2 }}>Редактировать</Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 500 }}>
          <TextField label="ФИО" name="fullName" value={formData.fullName} onChange={handleChange} error={!!errors.fullName} helperText={errors.fullName} fullWidth />
          <TextField label="Email" name="email" value={formData.email} onChange={handleChange} error={!!errors.email} helperText={errors.email} fullWidth />
          <TextField label="Телефон" name="phone" value={formData.phone} onChange={handleChange} error={!!errors.phone} helperText={errors.phone} fullWidth />
          <TextField label="Логин" name="username" value={formData.username} onChange={handleChange} error={!!errors.username} helperText={errors.username} fullWidth />
          
          <Divider sx={{ my: 2 }}><Typography variant="caption" color="textSecondary">Компания</Typography></Divider>
          <TextField label="Название компании" name="companyName" value={formData.companyName} onChange={handleChange} fullWidth />
          <TextField label="ИНН" name="taxId" value={formData.taxId} onChange={handleChange} fullWidth />

          <Divider sx={{ my: 2 }}><Typography variant="caption" color="textSecondary">Пароль</Typography></Divider>
          <TextField label="Старый пароль" name="oldPassword" type="password" value={formData.oldPassword} onChange={handleChange} error={!!errors.oldPassword} helperText={errors.oldPassword} fullWidth />
          <TextField label="Новый пароль" name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} error={!!errors.newPassword} helperText={errors.newPassword} fullWidth />
          <TextField label="Подтвердите пароль" name="confirmNewPassword" type="password" value={formData.confirmNewPassword} onChange={handleChange} error={!!errors.confirmNewPassword} helperText={errors.confirmNewPassword} fullWidth />
          
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={handleUpdate}>Сохранить</Button>
            <Button variant="outlined" onClick={() => { setIsEditing(false); setErrors({}); }}>Отмена</Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
