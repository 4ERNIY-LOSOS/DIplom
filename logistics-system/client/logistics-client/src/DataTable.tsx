import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Column {
  id: string;
  label: string;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onEdit?: (item: any) => void;
  onDelete?: (id: number) => void;
}

export default function DataTable({ columns, data, onEdit, onDelete }: DataTableProps) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.id}>{col.label}</TableCell>
            ))}
            {(onEdit || onDelete) && <TableCell align="right">Действия</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              {columns.map((col) => (
                <TableCell key={col.id}>{row[col.id]}</TableCell>
              ))}
              {(onEdit || onDelete) && (
                <TableCell align="right">
                  {onEdit && <IconButton onClick={() => onEdit(row)} color="primary"><EditIcon /></IconButton>}
                  {onDelete && <IconButton onClick={() => onDelete(row.id)} color="error"><DeleteIcon /></IconButton>}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
