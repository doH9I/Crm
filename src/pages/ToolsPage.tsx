import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const ToolsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Инструменты
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Управление инструментами и их состоянием будет реализовано здесь.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ToolsPage;