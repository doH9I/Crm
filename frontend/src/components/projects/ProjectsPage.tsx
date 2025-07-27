import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, TextField, Button, Tooltip, CircularProgress, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const statusOptions = ['В работе', 'Завершён', 'Пауза'];

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/projects/projects/');
        setProjects(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filtered = projects.filter(p =>
    (p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.customer && p.customer.toLowerCase().includes(search.toLowerCase()))) &&
    (status ? p.status === status : true)
  );

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Проекты');
    XLSX.writeFile(wb, 'projects.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Проекты', 14, 16);
    (doc as any).autoTable({
      head: [['Название', 'Заказчик', 'Бюджет', 'Старт', 'Завершение', 'Статус', 'Менеджер']],
      body: filtered.map(p => [p.name, p.customer, p.budget, p.start_date, p.end_date, p.status, p.manager?.username]),
      startY: 22,
    });
    doc.save('projects.pdf');
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Проекты</Typography>
        <Box>
          <Tooltip title="Экспорт в Excel"><IconButton onClick={exportExcel}><FileDownloadIcon /></IconButton></Tooltip>
          <Tooltip title="Экспорт в PDF"><IconButton onClick={exportPDF}><FileDownloadIcon color="secondary" /></IconButton></Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} sx={{ ml: 2 }}>Добавить</Button>
        </Box>
      </Box>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Поиск по проекту или заказчику"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ flex: 2 }}
        />
        <FormControl sx={{ flex: 1, minWidth: 120 }}>
          <InputLabel>Статус</InputLabel>
          <Select
            value={status}
            label="Статус"
            onChange={e => setStatus(e.target.value)}
          >
            <MenuItem value="">Все</MenuItem>
            {statusOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Заказчик</TableCell>
                <TableCell>Бюджет</TableCell>
                <TableCell>Старт</TableCell>
                <TableCell>Завершение</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Менеджер</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} align="center"><CircularProgress /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center">Нет данных</TableCell></TableRow>
              ) : filtered.map(p => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.customer}</TableCell>
                  <TableCell>{p.budget}</TableCell>
                  <TableCell>{p.start_date}</TableCell>
                  <TableCell>{p.end_date}</TableCell>
                  <TableCell>{p.status}</TableCell>
                  <TableCell>{p.manager?.username}</TableCell>
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