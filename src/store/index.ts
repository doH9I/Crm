import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { 
  User, 
  Project, 
  Material, 
  Tool, 
  DashboardStats, 
  Notification,
  AppSettings 
} from '../types';

// Типы состояний
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  fetchProjects: () => Promise<void>;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
}

interface MaterialState {
  materials: Material[];
  isLoading: boolean;
  fetchMaterials: () => Promise<void>;
  createMaterial: (material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateMaterial: (id: string, updates: Partial<Material>) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
  updateStock: (id: string, quantity: number, type: 'in' | 'out') => Promise<void>;
}

interface ToolState {
  tools: Tool[];
  isLoading: boolean;
  fetchTools: () => Promise<void>;
  createTool: (tool: Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTool: (id: string, updates: Partial<Tool>) => Promise<void>;
  deleteTool: (id: string) => Promise<void>;
  assignTool: (toolId: string, userId: string) => Promise<void>;
}

interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  fetchStats: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

interface AppState {
  settings: AppSettings;
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  isLoading: boolean;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  toggleSidebar: () => void;
  toggleTheme: () => void;
}

// Заглушки данных для демонстрации
const mockUser: User = {
  id: '1',
  email: 'admin@construction-crm.ru',
  name: 'Администратор',
  phone: '+7 (999) 123-45-67',
  role: 'admin' as any,
  avatar: '',
  isActive: true,
  salary: 80000,
  hireDate: new Date('2020-01-01'),
  department: 'Управление',
  skills: ['Управление проектами', 'Планирование', 'Контроль качества'],
  lastLogin: new Date(),
  createdAt: new Date('2020-01-01'),
  updatedAt: new Date()
};

const mockStats: DashboardStats = {
  totalProjects: 25,
  activeProjects: 8,
  completedProjects: 15,
  totalRevenue: 12500000,
  monthlyRevenue: 2100000,
  totalExpenses: 8900000,
  monthlyExpenses: 1450000,
  profit: 3600000,
  employeeCount: 24,
  activeEmployees: 22,
  materialCount: 156,
  lowStockMaterials: 12,
  toolCount: 89,
  brokenTools: 3
};

const defaultSettings: AppSettings = {
  companyName: 'СтройКомпани ООО',
  currency: 'RUB',
  timezone: 'Europe/Moscow',
  language: 'ru',
  theme: 'light',
  notifications: {
    email: true,
    push: true,
    lowStock: true,
    projectDeadlines: true,
    maintenanceReminders: true
  }
};

// Store для аутентификации
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      immer((set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,

        login: async (email: string, password: string) => {
          set((state) => {
            state.isLoading = true;
          });

          try {
            // Имитация API запроса
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (email === 'admin@construction-crm.ru' && password === 'admin123') {
              set((state) => {
                state.user = mockUser;
                state.isAuthenticated = true;
                state.isLoading = false;
              });
              return true;
            } else {
              set((state) => {
                state.isLoading = false;
              });
              return false;
            }
          } catch (error) {
            set((state) => {
              state.isLoading = false;
            });
            return false;
          }
        },

        logout: () => {
          set((state) => {
            state.user = null;
            state.isAuthenticated = false;
          });
        },

        updateProfile: (updates: Partial<User>) => {
          set((state) => {
            if (state.user) {
              Object.assign(state.user, updates);
              state.user.updatedAt = new Date();
            }
          });
        }
      })),
      {
        name: 'auth-storage',
        partialize: (state) => ({ 
          user: state.user, 
          isAuthenticated: state.isAuthenticated 
        })
      }
    )
  )
);

// Store для проектов
export const useProjectStore = create<ProjectState>()(
  devtools(
    immer((set, get) => ({
      projects: [],
      currentProject: null,
      isLoading: false,

      fetchProjects: async () => {
        set((state) => {
          state.isLoading = true;
        });

        try {
          // Имитация API запроса
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const mockProjects: Project[] = [
            {
              id: '1',
              name: 'Жилой комплекс "Солнечный"',
              description: 'Строительство 3-этажного жилого дома',
              client: 'ООО "Инвест-Строй"',
              clientContact: 'Иванов И.И.',
              clientPhone: '+7 (999) 111-22-33',
              address: 'г. Москва, ул. Строительная, 15',
              status: 'in_progress' as any,
              startDate: new Date('2024-01-15'),
              plannedEndDate: new Date('2024-08-31'),
              budget: 8500000,
              spentAmount: 3200000,
              managerId: '1',
              teamMembers: ['1', '2', '3'],
              progress: 38,
              priority: 'high',
              createdAt: new Date('2024-01-10'),
              updatedAt: new Date()
            },
            {
              id: '2', 
              name: 'Офисное здание "Бизнес-Центр"',
              description: 'Реконструкция офисного здания',
              client: 'ИП Петров П.П.',
              address: 'г. Москва, пр-т Мира, 45',
              status: 'planning' as any,
              startDate: new Date('2024-03-01'),
              plannedEndDate: new Date('2024-12-15'),
              budget: 12000000,
              spentAmount: 0,
              managerId: '1',
              teamMembers: ['1'],
              progress: 5,
              priority: 'medium',
              createdAt: new Date('2024-02-20'),
              updatedAt: new Date()
            }
          ];

          set((state) => {
            state.projects = mockProjects;
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.isLoading = false;
          });
        }
      },

      createProject: async (projectData) => {
        const newProject: Project = {
          ...projectData,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        };

        set((state) => {
          state.projects.push(newProject);
        });

        return newProject.id;
      },

      updateProject: async (id, updates) => {
        set((state) => {
          const index = state.projects.findIndex(p => p.id === id);
          if (index !== -1) {
            Object.assign(state.projects[index], updates);
            state.projects[index].updatedAt = new Date();
          }
        });
      },

      deleteProject: async (id) => {
        set((state) => {
          state.projects = state.projects.filter(p => p.id !== id);
          if (state.currentProject?.id === id) {
            state.currentProject = null;
          }
        });
      },

      setCurrentProject: (project) => {
        set((state) => {
          state.currentProject = project;
        });
      }
    }))
  )
);

// Store для материалов
export const useMaterialStore = create<MaterialState>()(
  devtools(
    immer((set, get) => ({
      materials: [],
      isLoading: false,

      fetchMaterials: async () => {
        set((state) => {
          state.isLoading = true;
        });

        try {
          await new Promise(resolve => setTimeout(resolve, 600));
          
          const mockMaterials: Material[] = [
            {
              id: '1',
              name: 'Цемент М400',
              description: 'Портландцемент марки 400',
              category: 'Вяжущие материалы',
              unit: 'кг',
              currentStock: 2500,
              minStock: 500,
              maxStock: 5000,
              unitPrice: 8.50,
              supplier: 'ООО "СтройМатериалы"',
              location: 'Склад А, стеллаж 1',
              isActive: true,
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date()
            },
            {
              id: '2',
              name: 'Кирпич керамический',
              description: 'Кирпич красный полнотелый',
              category: 'Стеновые материалы',
              unit: 'шт',
              currentStock: 15000,
              minStock: 2000,
              maxStock: 20000,
              unitPrice: 12.30,
              supplier: 'Кирпичный завод №1',
              location: 'Склад Б, площадка 2',
              isActive: true,
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date()
            }
          ];

          set((state) => {
            state.materials = mockMaterials;
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.isLoading = false;
          });
        }
      },

      createMaterial: async (materialData) => {
        const newMaterial: Material = {
          ...materialData,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        };

        set((state) => {
          state.materials.push(newMaterial);
        });

        return newMaterial.id;
      },

      updateMaterial: async (id, updates) => {
        set((state) => {
          const index = state.materials.findIndex(m => m.id === id);
          if (index !== -1) {
            Object.assign(state.materials[index], updates);
            state.materials[index].updatedAt = new Date();
          }
        });
      },

      deleteMaterial: async (id) => {
        set((state) => {
          state.materials = state.materials.filter(m => m.id !== id);
        });
      },

      updateStock: async (id, quantity, type) => {
        set((state) => {
          const material = state.materials.find(m => m.id === id);
          if (material) {
            if (type === 'in') {
              material.currentStock += quantity;
            } else {
              material.currentStock = Math.max(0, material.currentStock - quantity);
            }
            material.updatedAt = new Date();
          }
        });
      }
    }))
  )
);

// Store для дашборда
export const useDashboardStore = create<DashboardState>()(
  devtools(
    immer((set, get) => ({
      stats: null,
      isLoading: false,

      fetchStats: async () => {
        set((state) => {
          state.isLoading = true;
        });

        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set((state) => {
            state.stats = mockStats;
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.isLoading = false;
          });
        }
      },

      refreshStats: async () => {
        const { fetchStats } = get();
        await fetchStats();
      }
    }))
  )
);

// Store для приложения
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer((set, get) => ({
        settings: defaultSettings,
        sidebarOpen: true,
        theme: 'light',
        isLoading: false,

        updateSettings: async (newSettings) => {
          set((state) => {
            Object.assign(state.settings, newSettings);
          });
        },

        toggleSidebar: () => {
          set((state) => {
            state.sidebarOpen = !state.sidebarOpen;
          });
        },

        toggleTheme: () => {
          set((state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
          });
        }
      })),
      {
        name: 'app-storage',
        partialize: (state) => ({ 
          settings: state.settings, 
          theme: state.theme,
          sidebarOpen: state.sidebarOpen 
        })
      }
    )
  )
);