import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, TextField, Button, Tooltip, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/users/users/');
        setUsers(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.first_name && u.first_name.toLowerCase().includes(search.toLowerCase())) ||
    (u.last_name && u.last_name.toLowerCase().includes(search.toLowerCase()))
  );

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Сотрудники');
    XLSX.writeFile(wb, 'users.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Сотрудники', 14, 16);
    (doc as any).autoTable({
      head: [['Логин', 'Имя', 'Фамилия', 'Email', 'Роль', 'Оклад', 'Телефон']],
      body: filtered.map(u => [u.username, u.first_name, u.last_name, u.email, u.role?.name, u.salary, u.phone]),
      startY: 22,
    });
    doc.save('users.pdf');
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Сотрудники</Typography>
        <Box>
          <Tooltip title="Экспорт в Excel"><IconButton onClick={exportExcel}><FileDownloadIcon /></IconButton></Tooltip>
          <Tooltip title="Экспорт в PDF"><IconButton onClick={exportPDF}><FileDownloadIcon color="secondary" /></IconButton></Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} sx={{ ml: 2 }}>Добавить</Button>
        </Box>
      </Box>
      <TextField
        label="Поиск сотрудника"
        value={search}
        onChange={e => setSearch(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Логин</TableCell>
                <TableCell>Имя</TableCell>
                <TableCell>Фамилия</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Роль</TableCell>
                <TableCell>Оклад</TableCell>
                <TableCell>Телефон</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} align="center"><CircularProgress /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center">Нет данных</TableCell></TableRow>
              ) : filtered.map(u => (
                <TableRow key={u.id}>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{u.first_name}</TableCell>
                  <TableCell>{u.last_name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role?.name}</TableCell>
                  <TableCell>{u.salary}</TableCell>
                  <TableCell>{u.phone}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small"><EditIcon /></IconButton>
                    <IconButton size="small" color="error"><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};