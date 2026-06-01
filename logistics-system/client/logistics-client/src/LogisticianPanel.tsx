import { useEffect, useState } from 'react';
import api from './api';
import dayjs from 'dayjs';
import { 
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Box, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem, Divider, Chip
} from '@mui/material';

export default function LogisticianPanel({ view = 'orders' }: { view?: 'orders' | 'shipments' }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  
  const [openProcessDialog, setOpenProcessDialog] = useState(false);
  const [processData, setProcessData] = useState({ 
    pickupDate: '', deliveryStartDate: '', deliveryEndDate: '', 
    vehicleId: '', driverId: '' 
  });
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    refreshData();
  }, []);

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
      await api.patch(`/orders/${selectedOrder.id}`, {
        pickupDate: processData.pickupDate,
        deliveryStartDate: processData.deliveryStartDate,
        deliveryEndDate: processData.deliveryEndDate,
        status: 'Planned'
      });
      await api.post('/shipments', { vehicleId: processData.vehicleId, driverId: processData.driverId, orderId: selectedOrder.id });
      setOpenProcessDialog(false);
      refreshData();
      alert('Заявка успешно обработана');
    } catch (e: any) {
      alert('Ошибка при обработке');
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
            <TextField select fullWidth label="Машина" value={processData.vehicleId} onChange={(e) => setProcessData({...processData, vehicleId: e.target.value})} sx={{ mb: 2 }}>
                {vehicles.filter(v => v.status === 'available').map(v => <MenuItem key={v.id} value={v.id}>{v.model} ({v.capacity}кг / {v.volumeCapacity}м³)</MenuItem>)}
            </TextField>
            <TextField select fullWidth label="Водитель" value={processData.driverId} onChange={(e) => setProcessData({...processData, driverId: e.target.value})}>
                {drivers.filter(d => d.status === 'available').map(d => <MenuItem key={d.id} value={d.id}>{d.fullName}</MenuItem>)}
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
            <Typography variant="h5" sx={{ mb: 2 }}>Новые заявки</Typography>
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
                    {orders.filter(o => o.status === 'Pending').map((o) => (
                    <TableRow key={o.id}>
                        <TableCell>{o.cargoName}</TableCell>
                        <TableCell>{o.originAddress} → {o.destinationAddress}</TableCell>
                        <TableCell>{o.weight}кг / {o.volume}м³</TableCell>
                        <TableCell><Button size="small" variant="contained" onClick={() => handleOpenProcessDialog(o)}>Обработать</Button></TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </TableContainer>
        </Box>
      )}

      {/* View: Перевозки */}
      {view === 'shipments' && (
        <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>Перевозки</Typography>
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
                    {shipments.map((s) => (
                    <TableRow key={s.id}>
                        <TableCell>#{s.orders?.[0]?.id}</TableCell>
                        <TableCell>{s.vehicle?.model} ({s.vehicle?.plateNumber})</TableCell>
                        <TableCell>{s.driver?.fullName}</TableCell>
                        <TableCell><Chip label={s.status} size="small" /></TableCell>
                        <TableCell>
                          {s.status === 'Planned' && (
                            <Button size="small" variant="contained" color="primary" onClick={() => handleUpdateStatus(s.id, 'In Transit')}>В путь</Button>
                          )}
                          {s.status === 'In Transit' && (
                            <Button size="small" variant="contained" color="success" onClick={() => handleUpdateStatus(s.id, 'Delivered')}>Доставлено</Button>
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
