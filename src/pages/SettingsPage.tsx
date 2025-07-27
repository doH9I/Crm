import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const SettingsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Настройки
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Настройки системы будут реализованы здесь.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPage;