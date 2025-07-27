import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, CircularProgress, Button, Tooltip, IconButton } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/analytics/auditlog/', { params: { search } });
        setLogs(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [search]);

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(logs);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'История');
    XLSX.writeFile(wb, 'auditlog.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('История действий', 14, 16);
    (doc as any).autoTable({
      head: [['Пользователь', 'Действие', 'Объект', 'ID', 'Описание', 'Дата', 'Изменения']],
      body: logs.map(l => [l.user, l.action, l.object_type, l.object_id, l.object_repr, l.timestamp, JSON.stringify(l.changes)]),
      startY: 22,
    });
    doc.save('auditlog.pdf');
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4">История действий</Typography>
        <Box>
          <Tooltip title="Экспорт в Excel"><IconButton onClick={exportExcel}><FileDownloadIcon /></IconButton></Tooltip>
          <Tooltip title="Экспорт в PDF"><IconButton onClick={exportPDF}><FileDownloadIcon color="secondary" /></IconButton></Tooltip>
        </Box>
      </Box>
      <TextField
        label="Поиск по пользователю, объекту или ID"
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
                <TableCell>Пользователь</TableCell>
                <TableCell>Действие</TableCell>
                <TableCell>Объект</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Описание</TableCell>
                <TableCell>Дата</TableCell>
                <TableCell>Изменения</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} align="center"><CircularProgress /></TableCell></TableRow>
              ) : logs.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center">Нет данных</TableCell></TableRow>
              ) : logs.map(l => (
                <TableRow key={l.id}>
                  <TableCell>{l.user}</TableCell>
                  <TableCell>{l.action}</TableCell>
                  <TableCell>{l.object_type}</TableCell>
                  <TableCell>{l.object_id}</TableCell>
                  <TableCell>{l.object_repr}</TableCell>
                  <TableCell>{new Date(l.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{l.changes ? JSON.stringify(l.changes) : ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};