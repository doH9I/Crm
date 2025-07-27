import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const EstimatesPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Сметы
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Создание и управление сметами будет реализовано здесь.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EstimatesPage;