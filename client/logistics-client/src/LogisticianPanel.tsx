import { useEffect, useState } from 'react';
import api from './api';
import dayjs from 'dayjs';
import { 
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Box, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem, Divider, Chip, Tabs, Tab, Alert
} from '@mui/material';

export default function LogisticianPanel({ view = 'orders' }: { view?: 'orders' | 'shipments' }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  
  const [tabValue, setTabValue] = useState(0);
  const [openProcessDialog, setOpenProcessDialog] = useState(false);
  const [processData, setProcessData] = useState({ 
    pickupDate: '', deliveryStartDate: '', deliveryEndDate: '', 
    vehicleId: '', driverId: '' 
  });
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    refreshData();
    setTabValue(0);
  }, [view]);

  const refreshData = async () => {
    const [ordersRes, shipmentsRes, vehiclesRes, driversRes] = await Promise.all([
      api.get('/orders'),
      api.get('/shipments'),
      api.get('/vehicles'),
      api.get('/drivers')
    ]);
    setOrders(ordersRes.data);
    setShipments(shipmentsRes.data);
    setVehicles(vehiclesRes.data);
    setDrivers(driversRes.data);
  };

  const handleOpenProcessDialog = (order: any) => {
    setSelectedOrder(order);
    setProcessData({ pickupDate: '', deliveryStartDate: '', deliveryEndDate: '', vehicleId: '', driverId: '' });
    setOpenProcessDialog(true);
  };

  const handleProcessOrder = async () => {
    const now = dayjs().startOf('day');
    if (!processData.pickupDate || dayjs(processData.pickupDate).isBefore(now)) return alert('Дата забора неверна!');
    if (!processData.deliveryStartDate || dayjs(processData.deliveryStartDate).isBefore(now)) return alert('Дата начала доставки неверна!');
    if (dayjs(processData.deliveryEndDate).isBefore(dayjs(processData.deliveryStartDate))) return alert('Дата окончания доставки раньше начала!');

    try {
      // Сначала обновляем даты в заказе
      await api.patch(`/orders/${selectedOrder.id}`, {
        pickupDate: processData.pickupDate,
        deliveryStartDate: processData.deliveryStartDate,
        deliveryEndDate: processData.deliveryEndDate,
        // Мы НЕ меняем статус здесь вручную на Planned, 
        // это сделает бэкенд при создании перевозки
      });

      // Создаем перевозку (она сама переведет заказ в Planned)
      await api.post('/shipments', { 
        vehicleId: processData.vehicleId, 
        driverId: processData.driverId, 
        orderId: selectedOrder.id 
      });

      setOpenProcessDialog(false);
      refreshData();
      alert('Заявка успешно обработана');
    } catch (e: any) {
      alert('Ошибка при обработке: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/shipments/${id}`, { status });
      refreshData();
    } catch (e: any) {
      alert('Ошибка обновления статуса');
    }
  };

  return (
    <Paper sx={{ p: 4, minHeight: '80vh', borderRadius: 2 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>Панель Логиста</Typography>

      {/* Диалог Обработки */}
      <Dialog open={openProcessDialog} onClose={() => setOpenProcessDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Обработка заявки: {selectedOrder?.cargoName}</DialogTitle>
        <DialogContent>
            <Typography variant="h6" sx={{ mb: 1 }}>{selectedOrder?.cargoName}</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}><strong>Вес:</strong> {selectedOrder?.weight} кг | <strong>Объем:</strong> {selectedOrder?.volume} м³</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>{selectedOrder?.originAddress} → {selectedOrder?.destinationAddress}</Typography>
            <Typography variant="body2" sx={{ mt: 2, mb: 0.5 }}>Дата забора</Typography>
            <TextField type="date" fullWidth value={processData.pickupDate} onChange={(e) => setProcessData({...processData, pickupDate: e.target.value})} />
            <Typography variant="body2" sx={{ mt: 2, mb: 0.5 }}>Дата доставки (начало)</Typography>
            <TextField type="date" fullWidth value={processData.deliveryStartDate} onChange={(e) => setProcessData({...processData, deliveryStartDate: e.target.value})} />
            <Typography variant="body2" sx={{ mt: 2, mb: 0.5 }}>Дата доставки (конец)</Typography>
            <TextField type="date" fullWidth value={processData.deliveryEndDate} onChange={(e) => setProcessData({...processData, deliveryEndDate: e.target.value})} />
            <Divider sx={{ my: 2 }} />
            
            {vehicles.filter(v => v.status === 'Свободен').length === 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>Нет свободных машин в автопарке</Alert>
            )}
            {drivers.filter(d => d.status === 'Свободен').length === 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>Нет свободных водителей на смене</Alert>
            )}

            <TextField select fullWidth label="Машина" value={processData.vehicleId} onChange={(e) => setProcessData({...processData, vehicleId: e.target.value})} sx={{ mb: 2 }} error={vehicles.filter(v => v.status === 'Свободен').length === 0}>
                {vehicles.filter(v => v.status === 'Свободен').map(v => <MenuItem key={v.id} value={v.id}>{v.model} ({v.capacity}кг / {v.volumeCapacity}м³)</MenuItem>)}
            </TextField>
            <TextField select fullWidth label="Водитель" value={processData.driverId} onChange={(e) => setProcessData({...processData, driverId: e.target.value})}>
                {drivers.filter(d => d.status === 'Свободен').map(d => <MenuItem key={d.id} value={d.id}>{d.fullName}</MenuItem>)}
            </TextField>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenProcessDialog(false)}>Отмена</Button>
            <Button onClick={handleProcessOrder} variant="contained" disabled={!processData.vehicleId || !processData.driverId}>Обработать</Button>
        </DialogActions>
      </Dialog>

      {/* View: Заявки */}
      {view === 'orders' && (
        <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>Новые заявки ({orders.filter(o => o.status === 'В ожидании').length})</Typography>
            
            <TableContainer component={Paper} variant="outlined">
                <Table>
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                        <TableCell>Груз</TableCell>
                        <TableCell>Откуда - Куда</TableCell>
                        <TableCell>Вес/Объем</TableCell>
                        <TableCell>Действия</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {orders
                        .filter(o => o.status === 'В ожидании')
                        .map((o) => (
                    <TableRow key={o.id}>
                        <TableCell>{o.cargoName}</TableCell>
                        <TableCell>{o.originAddress} → {o.destinationAddress}</TableCell>
                        <TableCell>{o.weight}кг / {o.volume}м³</TableCell>
                        <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Button size="small" variant="contained" onClick={() => handleOpenProcessDialog(o)}>Обработать</Button>
                                {(vehicles.filter(v => v.status === 'Свободен').length === 0 || drivers.filter(d => d.status === 'Свободен').length === 0) && (
                                    <Typography variant="caption" color="error" sx={{ fontWeight: 'bold' }}>
                                        Нет ресурсов
                                    </Typography>
                                )}
                            </Box>
                        </TableCell>
                    </TableRow>
                    ))}
                    {orders.filter(o => o.status === 'В ожидании').length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                          Нет новых заявок, ожидающих обработки
                        </TableCell>
                      </TableRow>
                    )}
                </TableBody>
                </Table>
            </TableContainer>
        </Box>
      )}

      {/* View: Перевозки */}
      {view === 'shipments' && (
        <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>Перевозки</Typography>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2 }}>
                <Tab label={`Активные (${shipments.filter(s => s.status !== 'Доставлено').length})`} />
                <Tab label={`Завершенные (${shipments.filter(s => s.status === 'Доставлено').length})`} />
            </Tabs>

            <TableContainer component={Paper} variant="outlined">
            <Table>
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                        <TableCell>Заявка</TableCell>
                        <TableCell>Машина</TableCell>
                        <TableCell>Водитель</TableCell>
                        <TableCell>Статус</TableCell>
                        <TableCell>Действия</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {shipments
                        .filter(s => tabValue === 0 ? s.status !== 'Доставлено' : s.status === 'Доставлено')
                        .map((s) => (
                    <TableRow key={s.id}>
                        <TableCell>{s.orders?.[0]?.cargoName || 'Нет данных'}</TableCell>
                        <TableCell>{s.vehicle?.model} ({s.vehicle?.plateNumber})</TableCell>
                        <TableCell>{s.driver?.fullName}</TableCell>
                        <TableCell><Chip label={s.status} size="small" color={s.status === 'Доставлено' ? 'success' : 'primary'} /></TableCell>
                        <TableCell>
                          {s.status === 'Запланировано' && (
                            <Button size="small" variant="contained" color="warning" onClick={() => handleUpdateStatus(s.id, 'Подтверждено')}>Подтвердить</Button>
                          )}
                          {s.status === 'Подтверждено' && (
                            <Button size="small" variant="contained" color="primary" onClick={() => handleUpdateStatus(s.id, 'В пути')}>В путь</Button>
                          )}
                          {s.status === 'В пути' && (
                            <Button size="small" variant="contained" color="success" onClick={() => handleUpdateStatus(s.id, 'Доставлено')}>Доставлено</Button>
                          )}
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
            </TableContainer>
        </Box>
      )}
    </Paper>
  );
}
