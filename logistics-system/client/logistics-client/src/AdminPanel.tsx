import { useEffect, useState } from 'react';
import api from './api';
import { 
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Box, Tabs, Tab, Button, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem, Chip, CircularProgress, Alert,
  Switch, FormControlLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddCircleIcon from '@mui/icons-material/AddCircle';

interface User {
  id: number;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  company: { id: number; name: string } | null;
  role: { id: number; name: string } | null;
}

export default function AdminPanel() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [tariffs, setTariffs] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Состояния для диалога пользователя
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userFormData, setUserFormData] = useState({
    username: '', fullName: '', email: '', phone: '', password: '', 
    roleId: '', companyName: '', taxId: ''
  });

  // Состояния для диалога транспорта
  const [openVehicleDialog, setOpenVehicleDialog] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [vehicleFormData, setVehicleFormData] = useState({
    model: '', plateNumber: '', capacity: 0, volumeCapacity: 0
  });

  // Состояния для диалога водителей
  const [openDriverDialog, setOpenDriverDialog] = useState(false);
  const [editingDriver, setEditingDriver] = useState<any>(null);
  const [driverFormData, setDriverFormData] = useState({
    fullName: '', licenseNumber: '', phone: '', status: 'available'
  });

  // Состояния для диалога тарифов
  const [openTariffDialog, setOpenTariffDialog] = useState(false);
  const [editingTariff, setEditingTariff] = useState<any>(null);
  const [tariffFormData, setTariffFormData] = useState({
    name: '', basePrice: 0, pricePerKm: 0, pricePerKg: 0, isActive: true
  });

  useEffect(() => {
    refreshData();
  }, [tab]);

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 0) {
        const [uRes, rRes] = await Promise.all([api.get('/users'), api.get('/roles')]);
        setUsers(Array.isArray(uRes.data) ? uRes.data : []);
        setRoles(Array.isArray(rRes.data) ? rRes.data : []);
      } else if (tab === 1) {
        const res = await api.get('/companies');
        setCompanies(Array.isArray(res.data) ? res.data : []);
      } else if (tab === 2) {
        const res = await api.get('/orders');
        setOrders(Array.isArray(res.data) ? res.data : []);
      } else if (tab === 3) {
        const res = await api.get('/shipments');
        setShipments(Array.isArray(res.data) ? res.data : []);
      } else if (tab === 4) {
        const res = await api.get('/vehicles');
        setVehicles(Array.isArray(res.data) ? res.data : []);
      } else if (tab === 5) {
        const res = await api.get('/drivers');
        setDrivers(Array.isArray(res.data) ? res.data : []);
      } else if (tab === 6) {
        const res = await api.get('/tariffs');
        setTariffs(Array.isArray(res.data) ? res.data : []);
      } else if (tab === 7) {
        const res = await api.get('/audit-logs');
        setAuditLogs(Array.isArray(res.data) ? res.data : []);
      }
    } catch (e: any) {
      console.error('Ошибка загрузки данных админа', e);
      setError(e.response?.data?.message || 'Ошибка доступа или загрузки данных.');
    } finally {
      setLoading(false);
    }
  };

  // --- Функции для Пользователей ---
  const handleOpenUserDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setUserFormData({
        username: user.username,
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        roleId: user.role?.id.toString() || '',
        companyName: user.company?.name || '',
        taxId: ''
      });
    } else {
      setEditingUser(null);
      setUserFormData({ username: '', fullName: '', email: '', phone: '', password: '', roleId: '', companyName: '', taxId: '' });
    }
    setOpenUserDialog(true);
  };

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        const updateData: any = {
          username: userFormData.username, fullName: userFormData.fullName,
          email: userFormData.email, phone: userFormData.phone, roleId: userFormData.roleId
        };
        if (userFormData.password) updateData.newPassword = userFormData.password;
        if (userFormData.companyName) updateData.companyName = userFormData.companyName;
        if (userFormData.taxId) updateData.taxId = userFormData.taxId;
        await api.patch(`/users/${editingUser.id}`, updateData);
      } else {
        await api.post('/auth/register', { ...userFormData, passwordHash: userFormData.password });
      }
      setOpenUserDialog(false);
      refreshData();
      alert('Пользователь сохранен');
    } catch (e: any) { alert('Ошибка: ' + (e.response?.data?.message || e.message)); }
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('Удалить пользователя?')) {
      try { await api.delete(`/users/${id}`); refreshData(); } catch (e) { alert('Ошибка'); }
    }
  };

  // --- Функции для Транспорта ---
  const handleOpenVehicleDialog = (vehicle?: any) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setVehicleFormData({
        model: vehicle.model,
        plateNumber: vehicle.plateNumber,
        capacity: vehicle.capacity,
        volumeCapacity: vehicle.volumeCapacity
      });
    } else {
      setEditingVehicle(null);
      setVehicleFormData({ model: '', plateNumber: '', capacity: 0, volumeCapacity: 0 });
    }
    setOpenVehicleDialog(true);
  };

  const handleSaveVehicle = async () => {
    try {
      const data = { ...vehicleFormData, capacity: +vehicleFormData.capacity, volumeCapacity: +vehicleFormData.volumeCapacity };
      if (editingVehicle) {
        await api.patch(`/vehicles/${editingVehicle.id}`, data);
      } else {
        await api.post('/vehicles', data);
      }
      setOpenVehicleDialog(false);
      refreshData();
      alert('Транспорт сохранен');
    } catch (e: any) { alert('Ошибка: ' + (e.response?.data?.message || e.message)); }
  };

  const handleDeleteVehicle = async (id: number) => {
    if (window.confirm('Удалить этот транспорт?')) {
      try { await api.delete(`/vehicles/${id}`); refreshData(); } catch (e) { alert('Ошибка'); }
    }
  };

  // --- Функции для Водителей ---
  const handleOpenDriverDialog = (driver?: any) => {
    if (driver) {
      setEditingDriver(driver);
      setDriverFormData({
        fullName: driver.fullName,
        licenseNumber: driver.licenseNumber,
        phone: driver.phone || '',
        status: driver.status
      });
    } else {
      setEditingDriver(null);
      setDriverFormData({ fullName: '', licenseNumber: '', phone: '', status: 'available' });
    }
    setOpenDriverDialog(true);
  };

  const handleSaveDriver = async () => {
    try {
      if (driverFormData.phone && !/^[78][0-9]{10}$/.test(driverFormData.phone)) {
        return alert('Телефон должен быть в формате 11 цифр, начиная с 7 или 8');
      }
      if (editingDriver) {
        await api.patch(`/drivers/${editingDriver.id}`, driverFormData);
      } else {
        await api.post('/drivers', driverFormData);
      }
      setOpenDriverDialog(false);
      refreshData();
      alert('Водитель сохранен');
    } catch (e: any) { alert('Ошибка: ' + (e.response?.data?.message || e.message)); }
  };

  const handleDeleteDriver = async (id: number) => {
    if (window.confirm('Удалить этого водителя?')) {
      try { await api.delete(`/drivers/${id}`); refreshData(); } catch (e) { alert('Ошибка'); }
    }
  };

  // --- Функции для Тарифов ---
  const handleOpenTariffDialog = (tariff?: any) => {
    if (tariff) {
      setEditingTariff(tariff);
      setTariffFormData({
        name: tariff.name,
        basePrice: tariff.basePrice,
        pricePerKm: tariff.pricePerKm,
        pricePerKg: tariff.pricePerKg,
        isActive: tariff.isActive
      });
    } else {
      setEditingTariff(null);
      setTariffFormData({ name: '', basePrice: 0, pricePerKm: 0, pricePerKg: 0, isActive: true });
    }
    setOpenTariffDialog(true);
  };

  const handleSaveTariff = async () => {
    try {
      const data = { 
        ...tariffFormData, 
        basePrice: +tariffFormData.basePrice, 
        pricePerKm: +tariffFormData.pricePerKm, 
        pricePerKg: +tariffFormData.pricePerKg,
        isActive: !!tariffFormData.isActive
      };
      if (editingTariff) {
        await api.patch(`/tariffs/${editingTariff.id}`, data);
      } else {
        await api.post('/tariffs', data);
      }
      setOpenTariffDialog(false);
      refreshData();
      alert('Тариф сохранен');
    } catch (e: any) { alert('Ошибка: ' + (e.response?.data?.message || e.message)); }
  };

  const handleDeleteTariff = async (id: number) => {
    if (window.confirm('Удалить этот тариф?')) {
      try { await api.delete(`/tariffs/${id}`); refreshData(); } catch (e) { alert('Ошибка'); }
    }
  };

  return (
    <Paper sx={{ p: 4, minHeight: '80vh', borderRadius: 2 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>Система управления (Администратор)</Typography>
      
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Пользователи" />
        <Tab label="Компании" />
        <Tab label="Заявки" />
        <Tab label="Перевозки" />
        <Tab label="Транспорт" />
        <Tab label="Водители" />
        <Tab label="Тарифы" />
        <Tab label="Журнал действий" />
      </Tabs>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
      ) : (
        <>
          {tab === 0 && (
            <Box>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => handleOpenUserDialog()}>Добавить пользователя</Button>
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell>ФИО / Логин</TableCell><TableCell>Email / Телефон</TableCell><TableCell>Роль</TableCell><TableCell>Компания</TableCell><TableCell align="right">Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id} hover>
                        <TableCell><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{u.fullName || '—'}</Typography><Typography variant="caption" color="textSecondary">{u.username}</Typography></TableCell>
                        <TableCell><Typography variant="body2">{u.email || '—'}</Typography><Typography variant="caption" color="textSecondary">{u.phone || '—'}</Typography></TableCell>
                        <TableCell><Chip label={u.role ? u.role.name : 'Без роли'} size="small" /></TableCell>
                        <TableCell>{u.company ? u.company.name : 'Без компании'}</TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => handleOpenUserDialog(u)} color="primary"><EditIcon /></IconButton>
                          <IconButton onClick={() => handleDeleteUser(u.id)} color="error"><DeleteIcon /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {tab === 1 && (
            <TableContainer component={Paper} variant="outlined"><Table><TableHead sx={{ bgcolor: '#f5f5f5' }}><TableRow><TableCell>Название</TableCell><TableCell>ИНН</TableCell><TableCell>Дата создания</TableCell></TableRow></TableHead>
            <TableBody>{companies.map((c) => (<TableRow key={c.id}><TableCell>{c.name}</TableCell><TableCell>{c.taxId || '—'}</TableCell><TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell></TableRow>))}</TableBody></Table></TableContainer>
          )}

          {tab === 2 && (
            <TableContainer component={Paper} variant="outlined"><Table><TableHead sx={{ bgcolor: '#f5f5f5' }}><TableRow><TableCell>Груз</TableCell><TableCell>Компания</TableCell><TableCell>Откуда - Куда</TableCell><TableCell>Статус</TableCell></TableRow></TableHead>
            <TableBody>{orders.map((o) => (<TableRow key={o.id}><TableCell>{o.cargoName}</TableCell><TableCell>{o.company?.name}</TableCell><TableCell>{o.originAddress} → {o.destinationAddress}</TableCell><TableCell><Chip label={o.status} size="small" /></TableCell></TableRow>))}</TableBody></Table></TableContainer>
          )}

          {tab === 3 && (
            <TableContainer component={Paper} variant="outlined"><Table><TableHead sx={{ bgcolor: '#f5f5f5' }}><TableRow><TableCell>ID</TableCell><TableCell>Транспорт</TableCell><TableCell>Водитель</TableCell><TableCell>Статус</TableCell></TableRow></TableHead>
            <TableBody>{shipments.map((s) => (<TableRow key={s.id}><TableCell>#{s.id}</TableCell><TableCell>{s.vehicle?.model} ({s.vehicle?.plateNumber})</TableCell><TableCell>{s.driver?.fullName}</TableCell><TableCell><Chip label={s.status} size="small" /></TableCell></TableRow>))}</TableBody></Table></TableContainer>
          )}

          {tab === 4 && (
            <Box>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" startIcon={<AddCircleIcon />} onClick={() => handleOpenVehicleDialog()}>Добавить транспорт</Button>
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow><TableCell>Модель</TableCell><TableCell>Гос. номер</TableCell><TableCell>Грузоподъемность</TableCell><TableCell>Статус</TableCell><TableCell align="right">Действия</TableCell></TableRow>
                  </TableHead>
                  <TableBody>
                    {vehicles.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell>{v.model}</TableCell><TableCell>{v.plateNumber}</TableCell><TableCell>{v.capacity} кг / {v.volumeCapacity} м³</TableCell>
                        <TableCell><Chip label={v.status} size="small" color={v.status === 'available' ? 'success' : 'warning'} /></TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => handleOpenVehicleDialog(v)} color="primary"><EditIcon /></IconButton>
                          <IconButton onClick={() => handleDeleteVehicle(v.id)} color="error"><DeleteIcon /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {tab === 5 && (
            <Box>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" startIcon={<AddCircleIcon />} onClick={() => handleOpenDriverDialog()}>Добавить водителя</Button>
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow><TableCell>ФИО</TableCell><TableCell>Лицензия</TableCell><TableCell>Телефон</TableCell><TableCell>Статус</TableCell><TableCell align="right">Действия</TableCell></TableRow>
                  </TableHead>
                  <TableBody>
                    {drivers.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell>{d.fullName}</TableCell><TableCell>{d.licenseNumber}</TableCell><TableCell>{d.phone}</TableCell>
                        <TableCell><Chip label={d.status} size="small" color={d.status === 'available' ? 'success' : 'warning'} /></TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => handleOpenDriverDialog(d)} color="primary"><EditIcon /></IconButton>
                          <IconButton onClick={() => handleDeleteDriver(d.id)} color="error"><DeleteIcon /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {tab === 6 && (
            <Box>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" startIcon={<AddCircleIcon />} onClick={() => handleOpenTariffDialog()}>Добавить тариф</Button>
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow><TableCell>Название</TableCell><TableCell>Базовая цена</TableCell><TableCell>Цена за км</TableCell><TableCell>Цена за кг</TableCell><TableCell>Статус</TableCell><TableCell align="right">Действия</TableCell></TableRow>
                  </TableHead>
                  <TableBody>
                    {tariffs.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{t.name}</TableCell><TableCell>{t.basePrice} ₽</TableCell><TableCell>{t.pricePerKm} ₽</TableCell><TableCell>{t.pricePerKg} ₽</TableCell>
                        <TableCell><Chip label={t.isActive ? 'Активен' : 'Отключен'} size="small" color={t.isActive ? 'success' : 'default'} /></TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => handleOpenTariffDialog(t)} color="primary"><EditIcon /></IconButton>
                          <IconButton onClick={() => handleDeleteTariff(t.id)} color="error"><DeleteIcon /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {tab === 7 && (
            <TableContainer component={Paper} variant="outlined"><Table><TableHead sx={{ bgcolor: '#f5f5f5' }}><TableRow><TableCell>Дата</TableCell><TableCell>Действие</TableCell><TableCell>Сущность</TableCell><TableCell>ID</TableCell><TableCell>Детали</TableCell></TableRow></TableHead>
            <TableBody>{auditLogs.map((log) => (<TableRow key={log.id}><TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell><TableCell><Chip label={log.action} size="small" /></TableCell><TableCell>{log.entityType}</TableCell><TableCell>{log.entityId}</TableCell><TableCell>{log.details}</TableCell></TableRow>))}</TableBody></Table></TableContainer>
          )}
        </>
      )}

      {/* Диалог Пользователя */}
      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingUser ? 'Редактирование пользователя' : 'Новый пользователь'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}><Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Логин" fullWidth value={userFormData.username} onChange={(e) => setUserFormData({...userFormData, username: e.target.value})} />
          <TextField label="ФИО" fullWidth value={userFormData.fullName} onChange={(e) => setUserFormData({...userFormData, fullName: e.target.value})} />
          <TextField label="Email" fullWidth value={userFormData.email} onChange={(e) => setUserFormData({...userFormData, email: e.target.value})} />
          <TextField label="Телефон" fullWidth value={userFormData.phone} onChange={(e) => setUserFormData({...userFormData, phone: e.target.value})} />
          <TextField label={editingUser ? "Новый пароль (пусто = нет)" : "Пароль"} type="password" fullWidth value={userFormData.password} onChange={(e) => setUserFormData({...userFormData, password: e.target.value})} />
          <TextField label="Компания" fullWidth value={userFormData.companyName} onChange={(e) => setUserFormData({...userFormData, companyName: e.target.value})} />
          <TextField label="ИНН" fullWidth value={userFormData.taxId} onChange={(e) => setUserFormData({...userFormData, taxId: e.target.value})} />
          <TextField select label="Роль" fullWidth value={userFormData.roleId} onChange={(e) => setUserFormData({...userFormData, roleId: e.target.value})}>{roles.map((r: any) => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}</TextField>
        </Box></DialogContent>
        <DialogActions><Button onClick={() => setOpenUserDialog(false)}>Отмена</Button><Button onClick={handleSaveUser} variant="contained">Сохранить</Button></DialogActions>
      </Dialog>

      {/* Диалог Транспорта */}
      <Dialog open={openVehicleDialog} onClose={() => setOpenVehicleDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editingVehicle ? 'Редактировать транспорт' : 'Добавить транспорт'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}><Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Модель" fullWidth value={vehicleFormData.model} onChange={(e) => setVehicleFormData({...vehicleFormData, model: e.target.value})} />
          <TextField label="Гос. номер" fullWidth value={vehicleFormData.plateNumber} onChange={(e) => setVehicleFormData({...vehicleFormData, plateNumber: e.target.value})} />
          <TextField label="Грузоподъемность (кг)" type="number" fullWidth value={vehicleFormData.capacity} onChange={(e) => setVehicleFormData({...vehicleFormData, capacity: +e.target.value})} />
          <TextField label="Объем (м³)" type="number" fullWidth value={vehicleFormData.volumeCapacity} onChange={(e) => setVehicleFormData({...vehicleFormData, volumeCapacity: +e.target.value})} />
        </Box></DialogContent>
        <DialogActions><Button onClick={() => setOpenVehicleDialog(false)}>Отмена</Button><Button onClick={handleSaveVehicle} variant="contained">Сохранить</Button></DialogActions>
      </Dialog>

      {/* Диалог Водителя */}
      <Dialog open={openDriverDialog} onClose={() => setOpenDriverDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editingDriver ? 'Редактировать водителя' : 'Добавить водителя'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}><Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="ФИО" fullWidth value={driverFormData.fullName} onChange={(e) => setDriverFormData({...driverFormData, fullName: e.target.value})} />
          <TextField label="ВУ (номер)" fullWidth value={driverFormData.licenseNumber} onChange={(e) => setDriverFormData({...driverFormData, licenseNumber: e.target.value})} />
          <TextField 
            label="Телефон" 
            fullWidth 
            value={driverFormData.phone} 
            onChange={(e) => setDriverFormData({...driverFormData, phone: e.target.value.replace(/[^0-9]/g, '')})} 
          />
          <TextField select label="Статус" fullWidth value={driverFormData.status} onChange={(e) => setDriverFormData({...driverFormData, status: e.target.value})}>
            <MenuItem value="available">Доступен</MenuItem>
            <MenuItem value="busy">Занят</MenuItem>
          </TextField>
        </Box></DialogContent>
        <DialogActions><Button onClick={() => setOpenDriverDialog(false)}>Отмена</Button><Button onClick={handleSaveDriver} variant="contained">Сохранить</Button></DialogActions>
      </Dialog>

      {/* Диалог Тарифа */}
      <Dialog open={openTariffDialog} onClose={() => setOpenTariffDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editingTariff ? 'Редактировать тариф' : 'Добавить тариф'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}><Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Название" fullWidth value={tariffFormData.name} onChange={(e) => setTariffFormData({...tariffFormData, name: e.target.value})} />
          <TextField label="Базовая цена (₽)" type="number" fullWidth value={tariffFormData.basePrice} onChange={(e) => setTariffFormData({...tariffFormData, basePrice: +e.target.value})} />
          <TextField label="Цена за км (₽)" type="number" fullWidth value={tariffFormData.pricePerKm} onChange={(e) => setTariffFormData({...tariffFormData, pricePerKm: +e.target.value})} />
          <TextField label="Цена за кг (₽)" type="number" fullWidth value={tariffFormData.pricePerKg} onChange={(e) => setTariffFormData({...tariffFormData, pricePerKg: +e.target.value})} />
          <FormControlLabel
            control={<Switch checked={tariffFormData.isActive} onChange={(e) => setTariffFormData({...tariffFormData, isActive: e.target.checked})} />}
            label="Активный тариф"
          />
        </Box></DialogContent>
        <DialogActions><Button onClick={() => setOpenTariffDialog(false)}>Отмена</Button><Button onClick={handleSaveTariff} variant="contained">Сохранить</Button></DialogActions>
      </Dialog>
    </Paper>
  );
}
