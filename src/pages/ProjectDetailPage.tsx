import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import ProjectSelector from '../components/ProjectSelector';

const ProjectDetailPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Детали проекта
          </Typography>
          <ProjectSelector />
        </Box>
      </Box>
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