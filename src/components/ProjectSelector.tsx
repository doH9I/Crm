import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { Business as ProjectIcon } from '@mui/icons-material';
import { useProjectStore } from '../store';

interface ProjectSelectorProps {
  showProjectInfo?: boolean;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({ showProjectInfo = true }) => {
  const { selectedProject, isAllProjectsView } = useProjectStore();

  if (!showProjectInfo) {
    return null;
  }

  return (
    <Box sx={{ mt: 1 }}>
      {selectedProject && !isAllProjectsView && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ProjectIcon fontSize="small" color="primary" />
          <Typography variant="body2" color="text.secondary">
            Проект: <strong>{selectedProject.name}</strong>
          </Typography>
          <Chip 
            label={selectedProject.status === 'in_progress' ? 'В работе' : 
                   selectedProject.status === 'planning' ? 'Планирование' : 
                   selectedProject.status === 'completed' ? 'Завершен' : selectedProject.status}
            size="small"
            color={selectedProject.status === 'in_progress' ? 'success' : 
                   selectedProject.status === 'planning' ? 'warning' : 
                   selectedProject.status === 'completed' ? 'default' : 'primary'}
          />
        </Box>
      )}
      {isAllProjectsView && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ProjectIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            Все проекты
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ProjectSelector;