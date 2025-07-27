import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, MenuItem, Select, InputLabel, FormControl, CircularProgress, Tooltip, IconButton } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, Legend } from 'recharts';

const COLORS = ['#1976d2', '#64b5f6', '#90caf9', '#1565c0', '#42a5f5'];

const reportTypes = [
  { value: 'project', label: 'По проектам' },
  { value: 'employee', label: 'По сотрудникам' },
  { value: 'warehouse', label: 'По складу' },
];

export const AnalyticsPage: React.FC = () => {
  const [type, setType] = useState('project');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Для примера — можно заменить на /api/analytics/reports/?type=...
        if (type === 'project') {
          const res = await axios.get('/api/projects/projects/');
          setData(res.data.map((p: any) => ({ name: p.name, value: p.budget })));
        } else if (type === 'employee') {
          const res = await axios.get('/api/users/users/');
          setData(res.data.map((u: any) => ({ name: u.username, value: u.salary })));
        } else if (type === 'warehouse') {
          const res = await axios.get('/api/warehouse/materials/');
          setData(res.data.map((m: any) => ({ name: m.name, value: m.quantity })));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [type]);

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Аналитика');
    XLSX.writeFile(wb, 'analytics.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Аналитика', 14, 16);
    (doc as any).autoTable({
      head: [['Название', 'Значение']],
      body: data.map(d => [d.name, d.value]),
      startY: 22,
    });
    doc.save('analytics.pdf');
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Аналитика</Typography>
        <Box>
          <Tooltip title="Экспорт в Excel"><IconButton onClick={exportExcel}><FileDownloadIcon /></IconButton></Tooltip>
          <Tooltip title="Экспорт в PDF"><IconButton onClick={exportPDF}><FileDownloadIcon color="secondary" /></IconButton></Tooltip>
        </Box>
      </Box>
      <FormControl sx={{ minWidth: 220, mb: 2 }}>
        <InputLabel>Тип отчёта</InputLabel>
        <Select value={type} label="Тип отчёта" onChange={e => setType(e.target.value)}>
          {reportTypes.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
        </Select>
      </FormControl>
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        {loading ? <CircularProgress /> : data.length === 0 ? 'Нет данных' : (
          <ResponsiveContainer width="100%" height={350}>
            {type === 'project' || type === 'warehouse' ? (
              <BarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip />
                <Legend />
                <Bar dataKey="value" fill="#1976d2">
                  {data.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Bar>
              </BarChart>
            ) : (
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                  {data.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Legend />
                <ChartTooltip />
              </PieChart>
            )}
          </ResponsiveContainer>
        )}
      </Paper>
    </Box>
  );
};