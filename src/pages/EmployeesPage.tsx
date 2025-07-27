import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const EmployeesPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Сотрудники
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Управление персоналом, расчет зарплат и учет рабочего времени будет реализован здесь.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmployeesPage;