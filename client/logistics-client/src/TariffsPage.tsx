import { useEffect, useState } from 'react';
import { Typography, Paper } from '@mui/material';
import api from './api';
import DataTable from './DataTable';

export default function TariffsPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await api.get('/tariffs');
    setData(res.data);
  };

  const columns = [
    { id: 'id', label: 'ID' },
    { id: 'name', label: 'Название' },
    { id: 'price', label: 'Цена' }
  ];

  return (
    <Paper sx={{ p: 4, borderRadius: 2 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Тарифы</Typography>
      <DataTable columns={columns} data={data} />
    </Paper>
  );
}
