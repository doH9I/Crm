import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const CalendarPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Календарь
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Календарь планирования работ будет реализован здесь.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CalendarPage;