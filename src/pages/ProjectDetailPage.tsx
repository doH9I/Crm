import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const ProjectDetailPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Детали проекта
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Подробная информация о проекте будет отображаться здесь.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProjectDetailPage;