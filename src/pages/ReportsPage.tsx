import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const ReportsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Отчеты
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Аналитические отчеты и экспорт данных будет реализован здесь.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReportsPage;