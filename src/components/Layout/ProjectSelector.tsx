import React, { useState } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
} from '@mui/material';
import {
  Business as ProjectIcon,
  ExpandLess,
  ExpandMore,
  Check as CheckIcon,
  AllInclusive as AllProjectsIcon,
} from '@mui/icons-material';
import { useProjectStore } from '../../store';
import { Project } from '../../types';

const ProjectSelector: React.FC = () => {
  const { projects, selectedProject, showAllProjects, selectProject, setShowAllProjects } = useProjectStore();
  const [expanded, setExpanded] = useState(false);

  const handleProjectSelect = (project: Project | null) => {
    if (project) {
      selectProject(project);
    } else {
      setShowAllProjects();
    }
  };

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  const getCurrentProjectName = () => {
    if (showAllProjects) {
      return 'Все проекты';
    }
    return selectedProject?.name || 'Выберите проект';
  };

  const getCurrentProjectStatus = () => {
    if (showAllProjects) {
      return 'all';
    }
    return selectedProject?.status || 'none';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'success';
      case 'planning':
        return 'warning';
      case 'completed':
        return 'info';
      case 'all':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'В работе';
      case 'planning':
        return 'Планирование';
      case 'completed':
        return 'Завершен';
      case 'all':
        return 'Все проекты';
      default:
        return 'Не выбран';
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Button
        fullWidth
        variant="outlined"
        onClick={handleToggle}
        sx={{
          justifyContent: 'space-between',
          textTransform: 'none',
          borderColor: 'divider',
          '&:hover': {
            borderColor: 'primary.main',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ProjectIcon fontSize="small" />
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {getCurrentProjectName()}
            </Typography>
            <Chip
              label={getStatusLabel(getCurrentProjectStatus())}
              size="small"
              color={getStatusColor(getCurrentProjectStatus()) as any}
              variant="outlined"
            />
          </Box>
        </Box>
        {expanded ? <ExpandLess /> : <ExpandMore />}
      </Button>

      <Collapse in={expanded}>
        <Box sx={{ mt: 1 }}>
          <List dense>
            <ListItem
              button
              onClick={() => handleProjectSelect(null)}
              selected={showAllProjects}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <AllProjectsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Все проекты"
                primaryTypographyProps={{ variant: 'body2' }}
              />
              {showAllProjects && <CheckIcon fontSize="small" color="primary" />}
            </ListItem>

            <Divider sx={{ my: 1 }} />

            {projects.map((project) => (
              <ListItem
                key={project.id}
                button
                onClick={() => handleProjectSelect(project)}
                selected={selectedProject?.id === project.id}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ProjectIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={project.name}
                  secondary={`${project.client} • ${getStatusLabel(project.status)}`}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
                {selectedProject?.id === project.id && (
                  <CheckIcon fontSize="small" color="primary" />
                )}
              </ListItem>
            ))}
          </List>
        </Box>
      </Collapse>
    </Box>
  );
};

export default ProjectSelector;