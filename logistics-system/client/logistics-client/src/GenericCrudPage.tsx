import { useEffect, useState } from 'react';
import { Typography, Paper } from '@mui/material';
import api from './api';
import DataTable from './DataTable';

export default function GenericCrudPage({ title, endpoint, columns }: { title: string, endpoint: string, columns: any[] }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  const fetchData = async () => {
    const res = await api.get(endpoint);
    setData(res.data);
  };

  return (
    <Paper sx={{ p: 4, borderRadius: 2 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>{title}</Typography>
      <DataTable columns={columns} data={data} />
    </Paper>
  );
}
