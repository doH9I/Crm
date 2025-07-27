import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const ProjectsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Проекты
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Страница управления проектами будет реализована здесь.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProjectsPage;