import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const ProfilePage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Профиль пользователя
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Профиль пользователя и личные настройки будут реализованы здесь.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;