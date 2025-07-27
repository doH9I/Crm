import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, TextField, Button, Tooltip, CircularProgress, Tabs, Tab } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const WarehousePage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [tools, setTools] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [toolsRes, materialsRes] = await Promise.all([
          axios.get('/api/warehouse/tools/'),
          axios.get('/api/warehouse/materials/'),
        ]);
        setTools(toolsRes.data);
        setMaterials(materialsRes.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredTools = tools.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
  const filteredMaterials = materials.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(tab === 0 ? filteredTools : filteredMaterials);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, tab === 0 ? 'Инструменты' : 'Материалы');
    XLSX.writeFile(wb, tab === 0 ? 'tools.xlsx' : 'materials.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(tab === 0 ? 'Инструменты' : 'Материалы', 14, 16);
    (doc as any).autoTable({
      head: [tab === 0
        ? ['Название', 'Кол-во', 'Состояние', 'Местоположение', 'Последняя проверка']
        : ['Название', 'Кол-во', 'Ед.', 'Мин. остаток']],
      body: (tab === 0 ? filteredTools : filteredMaterials).map((item: any) =>
        tab === 0
          ? [item.name, item.quantity, item.condition, item.location, item.last_check]
          : [item.name, item.quantity, item.unit, item.min_stock]
      ),
      startY: 22,
    });
    doc.save(tab === 0 ? 'tools.pdf' : 'materials.pdf');
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Склад</Typography>
        <Box>
          <Tooltip title="Экспорт в Excel"><IconButton onClick={exportExcel}><FileDownloadIcon /></IconButton></Tooltip>
          <Tooltip title="Экспорт в PDF"><IconButton onClick={exportPDF}><FileDownloadIcon color="secondary" /></IconButton></Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} sx={{ ml: 2 }}>Добавить</Button>
        </Box>
      </Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Инструменты" />
        <Tab label="Материалы" />
      </Tabs>
      <TextField
        label={tab === 0 ? "Поиск по инструменту" : "Поиск по материалу"}
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
                {tab === 0 ? (
                  <>
                    <TableCell>Название</TableCell>
                    <TableCell>Кол-во</TableCell>
                    <TableCell>Состояние</TableCell>
                    <TableCell>Местоположение</TableCell>
                    <TableCell>Последняя проверка</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>Название</TableCell>
                    <TableCell>Кол-во</TableCell>
                    <TableCell>Ед.</TableCell>
                    <TableCell>Мин. остаток</TableCell>
                  </>
                )}
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={tab === 0 ? 6 : 5} align="center"><CircularProgress /></TableCell></TableRow>
              ) : (tab === 0 ? filteredTools : filteredMaterials).length === 0 ? (
                <TableRow><TableCell colSpan={tab === 0 ? 6 : 5} align="center">Нет данных</TableCell></TableRow>
              ) : (tab === 0 ? filteredTools : filteredMaterials).map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  {tab === 0 ? <><TableCell>{item.condition}</TableCell><TableCell>{item.location}</TableCell><TableCell>{item.last_check}</TableCell></> : <><TableCell>{item.unit}</TableCell><TableCell>{item.min_stock}</TableCell></>}
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