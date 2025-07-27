import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const MaterialsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Материалы
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Управление складскими материалами будет реализовано здесь.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MaterialsPage;