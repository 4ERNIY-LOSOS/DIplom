import { useState, useEffect } from 'react';
import api from './api';
import { 
  Typography, TextField, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Stepper, Step, StepLabel, Divider, Snackbar, Alert
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const steps = ['В ожидании', 'Запланировано', 'Подтверждено', 'В пути', 'Доставлено'];

export default function ClientDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [formData, setFormData] = useState({
    weight: '', volume: '', category: '', originAddress: '', destinationAddress: ''
  });
  const [calculation, setCalculation] = useState<{distance: number, price: number, tariffName?: string, error?: string} | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' as 'error' | 'success' });

  useEffect(() => { fetchOrders(); fetchVehicles(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (e: any) {
      if (e.response?.status !== 401) {
        setSnackbar({ open: true, message: 'Ошибка загрузки заявок', severity: 'error' });
      }
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles');
      setVehicles(res.data);
    } catch (e) {
      console.error('Ошибка загрузки машин');
    }
  };

  const handleCalculate = async () => {
    if (!formData.originAddress || !formData.destinationAddress || !formData.weight) {
      return setSnackbar({ open: true, message: 'Заполните адреса и вес для расчета', severity: 'error' });
    }
    setCalculating(true);
    try {
      const res = await api.post('/orders/calculate', {
        originAddress: formData.originAddress,
        destinationAddress: formData.destinationAddress,
        weight: Number(formData.weight)
      });
      setCalculation(res.data);
      setConfirmOpen(true);
    } catch (e: any) {
      setSnackbar({ open: true, message: 'Ошибка расчета стоимости', severity: 'error' });
    } finally {
      setCalculating(false);
    }
  };

  const createOrder = async () => {
    if (vehicles.length === 0) {
      return setSnackbar({ open: true, message: 'Автопарк не настроен. Добавьте машины в систему.', severity: 'error' });
    }

    const maxWeight = Math.max(...vehicles.map(v => v.capacity || 0));
    const maxVolume = Math.max(...vehicles.map(v => v.volumeCapacity || 0));

    if (Number(formData.weight) > maxWeight || Number(formData.volume) > maxVolume) {
      return setSnackbar({ open: true, message: `Груз превышает вместимость самой большой машины (${maxWeight} кг / ${maxVolume} м3).`, severity: 'error' });
    }

    try {
      await api.post('/orders', {
        ...formData,
        weight: Number(formData.weight),
        volume: Number(formData.volume)
      });
      setConfirmOpen(false);
      setOpen(false);
      setSuccessOpen(true);
      fetchOrders();
      setErrors({});
      setFormData({
        weight: '', volume: '', category: '', originAddress: '', destinationAddress: ''
      });
    } catch (e: any) {
      setSnackbar({ open: true, message: 'Ошибка создания заявки', severity: 'error' });
    }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const handleDetails = (order: any) => {
    const freshOrder = orders.find(o => o.id === order.id) || order;
    setSelectedOrder(freshOrder);
    setDetailsOpen(true);
  };

  const getStatusLabel = (status: string) => {
    const map: { [key: string]: string } = {
      'Pending': 'В ожидании',
      'Planned': 'Запланировано',
      'Confirmed': 'Подтверждено',
      'In Transit': 'В пути',
      'Delivered': 'Доставлено'
    };
    return map[status] || status;
  };

  const getActiveStep = (status: string) => {
    const map: { [key: string]: number } = {
      'Pending': 0,
      'Planned': 1,
      'Confirmed': 2,
      'In Transit': 3,
      'Delivered': 4
    };
    return map[status] ?? 0;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper sx={{ p: 4, minHeight: '80vh', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4">Мои заявки</Typography>
          <Button variant="contained" onClick={() => setOpen(true)} size="large">Создать заявку</Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
              <TableRow>
                <TableCell><strong>Название груза</strong></TableCell>
                <TableCell><strong>Статус</strong></TableCell>
                <TableCell align="right"><strong>Действия</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((o: any) => (
                <TableRow key={o.id} hover>
                  <TableCell>{o.cargoName}</TableCell>
                  <TableCell>{getStatusLabel(o.status)}</TableCell>
                  <TableCell align="right">
                    <Button variant="outlined" size="small" onClick={() => handleDetails(o)}>
                      Подробнее
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Новая заявка</DialogTitle>
          <DialogContent>
            <TextField fullWidth margin="normal" label="Вес (кг)" name="weight" type="number" onChange={handleChange} value={formData.weight} error={!!errors.weight} helperText={errors.weight} />
            <TextField fullWidth margin="normal" label="Объем (м3)" name="volume" type="number" onChange={handleChange} value={formData.volume} error={!!errors.volume} helperText={errors.volume} />
            <FormControl fullWidth margin="normal">
              <InputLabel>Категория</InputLabel>
              <Select name="category" value={formData.category} label="Категория" onChange={handleChange} error={!!errors.category}>
                {['Обычный', 'Хрупкий', 'Опасный', 'Скоропортящийся', 'Рефрижераторный', 'Крупногабаритный', 'Жидкости', 'Насыпной'].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField fullWidth margin="normal" label="Откуда" name="originAddress" onChange={handleChange} value={formData.originAddress} error={!!errors.originAddress} helperText={errors.originAddress} />
            <TextField fullWidth margin="normal" label="Куда" name="destinationAddress" onChange={handleChange} value={formData.destinationAddress} error={!!errors.destinationAddress} helperText={errors.destinationAddress} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Отмена</Button>
            <Button variant="contained" onClick={handleCalculate} disabled={calculating}>
              {calculating ? 'Расчет...' : 'Далее'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Детали заявки</DialogTitle>
          <DialogContent>
            {selectedOrder && (
              <Box sx={{ mt: 2 }}>
                <Typography><strong>Груз:</strong> {selectedOrder.cargoName}</Typography>
                <Typography><strong>Вес:</strong> {selectedOrder.weight} кг</Typography>
                <Typography><strong>Объем:</strong> {selectedOrder.volume} м3</Typography>
                <Typography><strong>Категория:</strong> {selectedOrder.category}</Typography>
                <Typography sx={{ mt: 2 }}><strong>Статус:</strong> {getStatusLabel(selectedOrder.status)}</Typography>
                <Typography sx={{ mt: 2 }}><strong>Откуда:</strong> {selectedOrder.originAddress}</Typography>
                <Typography><strong>Куда:</strong> {selectedOrder.destinationAddress}</Typography>
                {selectedOrder.status === 'Planned' && (
                  <Box sx={{ mt: 2, bgcolor: '#f0f7ff', p: 1, borderRadius: 1 }}>
                    <Typography><strong>Дата забора:</strong> {selectedOrder.pickupDate ? new Date(selectedOrder.pickupDate).toLocaleDateString() : 'Не указана'}</Typography>
                    <Typography><strong>Доставка:</strong> {selectedOrder.deliveryStartDate ? new Date(selectedOrder.deliveryStartDate).toLocaleDateString() : '---'} — {selectedOrder.deliveryEndDate ? new Date(selectedOrder.deliveryEndDate).toLocaleDateString() : '---'}</Typography>
                  </Box>
                )}
                <Divider sx={{ my: 2 }} />
                <Stepper activeStep={getActiveStep(selectedOrder.status)} alternativeLabel>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>
            )}
          </DialogContent>
          <DialogActions><Button onClick={() => setDetailsOpen(false)}>Закрыть</Button></DialogActions>
        </Dialog>

        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle>Подтверждение заявки</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle2" color="primary">ПАРАМЕТРЫ ГРУЗА:</Typography>
              <Typography>Вес: {formData.weight} кг, Объем: {formData.volume} м3</Typography>
              <Typography>Маршрут: {formData.originAddress} → {formData.destinationAddress}</Typography>
              
              <Divider sx={{ my: 1 }} />
              
              <Typography variant="subtitle2" color="primary">ПРЕДВАРИТЕЛЬНЫЙ РАСЧЕТ:</Typography>
              {calculation?.error ? (
                <Typography color="error">{calculation.error}</Typography>
              ) : (
                <>
                  <Typography>Расстояние: <strong>{calculation?.distance} км</strong></Typography>
                  <Typography>Тариф: <strong>{calculation?.tariffName}</strong></Typography>
                  <Typography variant="h6" sx={{ mt: 1 }}>Итого: <strong>{calculation?.price} ₽</strong></Typography>
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Редактировать</Button>
            <Button variant="contained" onClick={createOrder} disabled={!!calculation?.error}>Подтвердить</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={successOpen} onClose={() => setSuccessOpen(false)}>
          <DialogTitle>Успешно!</DialogTitle>
          <DialogContent><Typography>Заявка принята.</Typography></DialogContent>
          <DialogActions><Button onClick={() => setSuccessOpen(false)} variant="contained">ОК</Button></DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </LocalizationProvider>
  );
}
