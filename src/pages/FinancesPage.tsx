import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const FinancesPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Финансы
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Финансовый учет и бюджетирование будет реализовано здесь.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FinancesPage;