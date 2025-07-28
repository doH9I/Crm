import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  User,
  UserRole,
  Project,
  Material,
  Tool,
  DashboardStats,
  Notification,
  AppSettings,
  Supplier,
  SafetyIncident,
  Training,
  Invoice,
  QualityCheck,
  WeatherForecast,
  Equipment,
  CalendarEvent,
  Report,
  Template,
  Integration,
  Backup,
  ProjectTask,
  TimeEntry,
  Budget,
  Client,
  MaterialOrder,
  Contract,
} from '../types';

// Интерфейс для состояния аутентификации
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

// Интерфейс для состояния проектов
interface ProjectState {
  projects: Project[];
  tasks: ProjectTask[];
  loading: boolean;
  selectedProject: Project | null;
  showAllProjects: boolean;
  fetchProjects: () => Promise<void>;
  fetchProjectTasks: (projectId: string) => Promise<void>;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  selectProject: (project: Project | null) => void;
  setShowAllProjects: () => void;
  createTask: (task: Omit<ProjectTask, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<ProjectTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

// Интерфейс для состояния материалов и склада
interface MaterialState {
  materials: Material[];
  suppliers: Supplier[];
  orders: MaterialOrder[];
  loading: boolean;
  fetchMaterials: () => Promise<void>;
  fetchSuppliers: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  createMaterial: (material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMaterial: (id: string, updates: Partial<Material>) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
  createSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  createOrder: (order: Omit<MaterialOrder, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
}

// Интерфейс для состояния инструментов и оборудования
interface ToolState {
  tools: Tool[];
  equipment: Equipment[];
  loading: boolean;
  fetchTools: () => Promise<void>;
  fetchEquipment: () => Promise<void>;
  createTool: (tool: Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTool: (id: string, updates: Partial<Tool>) => Promise<void>;
  deleteTool: (id: string) => Promise<void>;
  createEquipment: (equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEquipment: (id: string, updates: Partial<Equipment>) => Promise<void>;
  assignTool: (toolId: string, userId: string) => Promise<void>;
  returnTool: (toolId: string) => Promise<void>;
}

// Интерфейс для состояния HR и сотрудников
interface HRState {
  employees: User[];
  timeEntries: TimeEntry[];
  trainings: Training[];
  loading: boolean;
  fetchEmployees: () => Promise<void>;
  fetchTimeEntries: () => Promise<void>;
  fetchTrainings: () => Promise<void>;
  createEmployee: (employee: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEmployee: (id: string, updates: Partial<User>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  createTimeEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  approveTimeEntry: (id: string) => Promise<void>;
  rejectTimeEntry: (id: string, reason: string) => Promise<void>;
  createTraining: (training: Omit<Training, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  enrollInTraining: (trainingId: string, userId: string) => Promise<void>;
}

// Интерфейс для состояния финансов
interface FinanceState {
  invoices: Invoice[];
  budgets: Budget[];
  contracts: Contract[];
  loading: boolean;
  fetchInvoices: () => Promise<void>;
  fetchBudgets: () => Promise<void>;
  fetchContracts: () => Promise<void>;
  createInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateInvoiceStatus: (id: string, status: string) => Promise<void>;
  createBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  createContract: (contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

// Интерфейс для состояния клиентов
interface ClientState {
  clients: Client[];
  loading: boolean;
  fetchClients: () => Promise<void>;
  createClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
}

// Интерфейс для состояния безопасности
interface SafetyState {
  incidents: SafetyIncident[];
  loading: boolean;
  fetchIncidents: () => Promise<void>;
  createIncident: (incident: Omit<SafetyIncident, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateIncident: (id: string, updates: Partial<SafetyIncident>) => Promise<void>;
  resolveIncident: (id: string, resolution: string) => Promise<void>;
}

// Интерфейс для состояния качества
interface QualityState {
  checks: QualityCheck[];
  loading: boolean;
  fetchQualityChecks: () => Promise<void>;
  createQualityCheck: (check: Omit<QualityCheck, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateQualityCheck: (id: string, updates: Partial<QualityCheck>) => Promise<void>;
}

// Интерфейс для состояния календаря
interface CalendarState {
  events: CalendarEvent[];
  loading: boolean;
  fetchEvents: () => Promise<void>;
  createEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

// Интерфейс для состояния отчетов
interface ReportState {
  reports: Report[];
  templates: Template[];
  loading: boolean;
  fetchReports: () => Promise<void>;
  fetchTemplates: () => Promise<void>;
  generateReport: (reportId: string, parameters: Record<string, any>) => Promise<void>;
  createTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<Template>) => Promise<void>;
}

// Интерфейс для состояния интеграций
interface IntegrationState {
  integrations: Integration[];
  backups: Backup[];
  loading: boolean;
  fetchIntegrations: () => Promise<void>;
  fetchBackups: () => Promise<void>;
  enableIntegration: (type: string, config: Record<string, any>) => Promise<void>;
  disableIntegration: (id: string) => Promise<void>;
  syncIntegration: (id: string) => Promise<void>;
  createBackup: (name: string, type: 'manual' | 'automatic') => Promise<void>;
  restoreBackup: (id: string) => Promise<void>;
}

// Интерфейс для состояния дашборда
interface DashboardState {
  stats: DashboardStats | null;
  loading: boolean;
  weather: WeatherForecast | null;
  fetchStats: () => Promise<void>;
  fetchWeather: (location: string) => Promise<void>;
}

// Интерфейс для состояния уведомлений
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

// Интерфейс для общего состояния приложения
interface AppState {
  settings: AppSettings;
  theme: 'light' | 'dark' | 'auto';
  sidebar: {
    isOpen: boolean;
    isPinned: boolean;
  };
  updateSettings: (settings: Partial<AppSettings>) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  pinSidebar: (pinned: boolean) => void;
}

// Store для аутентификации
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      immer((set, get) => ({
        user: null,
        isAuthenticated: false,
        login: async (email: string, password: string) => {
          // Симуляция логики аутентификации
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Предустановленные пользователи системы
          const users = [
            {
              id: '1',
              email: 'admin@construction-crm.ru',
              password: 'admin123',
              name: 'Главный Администратор',
              role: UserRole.ADMIN,
              avatar: '',
              isActive: true,
              permissions: ['*'], // Полный доступ ко всем разделам
              department: 'Управление',
              position: 'Системный администратор',
              phone: '+7 (999) 123-45-67',
            },
            {
              id: '2',
              email: 'manager@construction-crm.ru',
              password: 'manager123',
              name: 'Менеджер Проектов',
              role: UserRole.MANAGER,
              avatar: '',
              isActive: true,
              permissions: ['projects', 'estimates', 'employees', 'reports'],
              department: 'Управление проектами',
              position: 'Старший менеджер проектов',
              phone: '+7 (999) 234-56-78',
            },
            {
              id: '3',
              email: 'foreman@construction-crm.ru',
              password: 'foreman123',
              name: 'Мастер Строительства',
              role: UserRole.FOREMAN,
              avatar: '',
              isActive: true,
              permissions: ['projects', 'materials', 'tools', 'employees'],
              department: 'Производство',
              position: 'Прораб',
              phone: '+7 (999) 345-67-89',
            },
            {
              id: '4',
              email: 'accountant@construction-crm.ru',
              password: 'accountant123',
              name: 'Главный Бухгалтер',
              role: UserRole.ACCOUNTANT,
              avatar: '',
              isActive: true,
              permissions: ['finances', 'estimates', 'reports'],
              department: 'Финансы',
              position: 'Главный бухгалтер',
              phone: '+7 (999) 456-78-90',
            }
          ];
          
          const foundUser = users.find(u => u.email === email && u.password === password);
          
          if (foundUser) {
            const user: User = {
              id: foundUser.id,
              email: foundUser.email,
              name: foundUser.name,
              role: foundUser.role,
              avatar: foundUser.avatar,
              isActive: foundUser.isActive,
              permissions: foundUser.permissions,
              department: foundUser.department,
              position: foundUser.position,
              phone: foundUser.phone,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            set(state => {
              state.user = user;
              state.isAuthenticated = true;
            });
            return true;
          }
          return false;
        },
        logout: () => {
          set(state => {
            state.user = null;
            state.isAuthenticated = false;
          });
        },
        updateProfile: (updates: Partial<User>) => {
          set(state => {
            if (state.user) {
              Object.assign(state.user, updates);
            }
          });
        },
      })),
      { 
        name: 'auth-store',
        // Исключаем функции из сохранения
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);

// Store для проектов
export const useProjectStore = create<ProjectState>()(
  devtools(
    immer((set, get) => ({
      projects: [],
      tasks: [],
      loading: false as boolean,
      selectedProject: null,
      showAllProjects: false,
      fetchProjects: async () => {
        set(state => { state.loading = true; });
        try {
          // Симуляция API запроса
          await new Promise(resolve => setTimeout(resolve, 1000));
          const mockProjects: Project[] = [
            {
              id: '1',
              name: 'Жилой комплекс "Солнечный"',
              description: 'Строительство жилого комплекса из 3 домов',
              client: 'ООО "Инвест Строй"',
              clientContact: 'Иванов И.И.',
              clientPhone: '+7 (999) 123-45-67',
              clientEmail: 'ivanov@investstroy.ru',
              address: 'г. Москва, ул. Солнечная, 15',
              status: 'in_progress' as any,
              type: 'residential' as any,
              startDate: new Date('2024-01-15'),
              endDate: new Date('2024-12-15'),
              plannedEndDate: new Date('2024-12-01'),
              budget: 50000000,
              spentAmount: 25000000,
              approvedBudget: 52000000,
              contingencyFund: 2000000,
              managerId: '1',
              architectId: '2',
              engineerId: '3',
              teamMembers: ['1', '2', '3', '4', '5'],
              progress: 50,
              priority: 'high',
              notes: 'Проект идет по плану',
              riskLevel: 'medium',
              weatherSensitive: true,
              safetyRequirements: ['Защитные каски', 'Страховочные пояса'],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '2',
              name: 'Торговый центр "МегаМолл"',
              description: 'Строительство торгового центра площадью 50,000 м²',
              client: 'ООО "ТоргСтрой"',
              clientContact: 'Петров П.П.',
              clientPhone: '+7 (999) 987-65-43',
              clientEmail: 'petrov@torgstroy.ru',
              address: 'г. Москва, ул. Торговая, 25',
              status: 'planning' as any,
              type: 'commercial' as any,
              startDate: new Date('2024-03-01'),
              endDate: new Date('2025-06-01'),
              plannedEndDate: new Date('2025-05-01'),
              budget: 80000000,
              spentAmount: 5000000,
              approvedBudget: 85000000,
              contingencyFund: 3000000,
              managerId: '2',
              architectId: '3',
              engineerId: '4',
              teamMembers: ['2', '3', '4', '6', '7'],
              progress: 15,
              priority: 'medium',
              notes: 'Проект в стадии планирования',
              riskLevel: 'low',
              weatherSensitive: false,
              safetyRequirements: ['СИЗ', 'Ограждения'],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '3',
              name: 'Промышленный цех "ТехПром"',
              description: 'Строительство производственного цеха',
              client: 'ООО "ПромСтрой"',
              clientContact: 'Сидоров С.С.',
              clientPhone: '+7 (999) 555-44-33',
              clientEmail: 'sidorov@promstroy.ru',
              address: 'г. Москва, ул. Промышленная, 10',
              status: 'completed' as any,
              type: 'industrial' as any,
              startDate: new Date('2023-06-01'),
              endDate: new Date('2024-02-01'),
              plannedEndDate: new Date('2024-01-01'),
              budget: 30000000,
              spentAmount: 30000000,
              approvedBudget: 32000000,
              contingencyFund: 1000000,
              managerId: '3',
              architectId: '4',
              engineerId: '5',
              teamMembers: ['3', '4', '5', '8', '9'],
              progress: 100,
              priority: 'high',
              notes: 'Проект завершен успешно',
              riskLevel: 'low',
              weatherSensitive: true,
              safetyRequirements: ['Спецодежда', 'Защитные очки'],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
          
          set(state => {
            state.projects = mockProjects;
            state.loading = false;
          });
        } catch (error) {
          set(state => { state.loading = false; });
        }
      },
      fetchProjectTasks: async (projectId: string) => {
        set(state => { state.loading = true; });
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          // Здесь будет загрузка задач проекта
          set(state => { state.loading = false; });
        } catch (error) {
          set(state => { state.loading = false; });
        }
      },
      createProject: async (project) => {
        const newProject: Project = {
          ...project,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set(state => {
          state.projects.push(newProject);
        });
      },
      updateProject: async (id, updates) => {
        set(state => {
          const index = state.projects.findIndex((p: Project) => p.id === id);
          if (index !== -1) {
            Object.assign(state.projects[index], updates, { updatedAt: new Date() });
          }
        });
      },
      deleteProject: async (id) => {
        set(state => {
          state.projects = state.projects.filter((p: Project) => p.id !== id);
        });
      },
      selectProject: (project) => {
        set(state => {
          state.selectedProject = project;
          state.showAllProjects = false;
        });
      },
      setShowAllProjects: () => {
        set(state => {
          state.selectedProject = null;
          state.showAllProjects = true;
        });
      },
      createTask: async (task) => {
        const newTask: ProjectTask = {
          ...task,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set(state => {
          state.tasks.push(newTask);
        });
      },
      updateTask: async (id, updates) => {
        set(state => {
          const index = state.tasks.findIndex((t: ProjectTask) => t.id === id);
          if (index !== -1) {
            Object.assign(state.tasks[index], updates, { updatedAt: new Date() });
          }
        });
      },
      deleteTask: async (id) => {
        set(state => {
          state.tasks = state.tasks.filter((t: ProjectTask) => t.id !== id);
        });
      },
    }))
  )
);

// Store для материалов
export const useMaterialStore = create<MaterialState>()(
  devtools(
    immer((set, get) => ({
      materials: [],
      suppliers: [],
      orders: [],
      loading: false as boolean,
      fetchMaterials: async () => {
        set(state => { state.loading = true; });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const mockMaterials: Material[] = [
            {
              id: '1',
              name: 'Цемент М400',
              description: 'Портландцемент марки 400',
              category: 'Сухие смеси',
              subcategory: 'Цемент',
              sku: 'CEM-M400-50',
              unit: 'мешок',
              currentStock: 150,
              reservedStock: 20,
              availableStock: 130,
              minStock: 50,
              maxStock: 300,
              reorderPoint: 60,
              unitPrice: 350,
              avgPrice: 345,
              lastPurchasePrice: 350,
              supplier: 'ООО Цементторг',
              location: 'Склад А',
              zone: 'А1',
              shelf: 'А1-01',
              isActive: true,
              isHazardous: false,
              weight: 50,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
          
          set(state => {
            state.materials = mockMaterials;
            state.loading = false;
          });
        } catch (error) {
          set(state => { state.loading = false; });
        }
      },
      fetchSuppliers: async () => {
        // Реализация загрузки поставщиков
      },
      fetchOrders: async () => {
        // Реализация загрузки заказов
      },
      createMaterial: async (material) => {
        const newMaterial: Material = {
          ...material,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set(state => {
          state.materials.push(newMaterial);
        });
      },
      updateMaterial: async (id, updates) => {
        set(state => {
          const index = state.materials.findIndex((m: Material) => m.id === id);
          if (index !== -1) {
            Object.assign(state.materials[index], updates, { updatedAt: new Date() });
          }
        });
      },
      deleteMaterial: async (id) => {
        set(state => {
          state.materials = state.materials.filter((m: Material) => m.id !== id);
        });
      },
      createSupplier: async (supplier) => {
        // Реализация создания поставщика
      },
      createOrder: async (order) => {
        // Реализация создания заказа
      },
      updateOrderStatus: async (id, status) => {
        // Реализация обновления статуса заказа
      },
    }))
  )
);

// Store для инструментов
export const useToolStore = create<ToolState>()(
  devtools(
    immer((set, get) => ({
      tools: [],
      equipment: [],
      loading: false as boolean,
      fetchTools: async () => {
        set(state => { state.loading = true; });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const mockTools: Tool[] = [
            {
              id: '1',
              name: 'Дрель ударная Makita HP2050',
              category: 'Электроинструмент',
              subcategory: 'Дрели',
              brand: 'Makita',
              model: 'HP2050',
              inventoryNumber: 'TOOL-001',
              condition: 'good' as any,
              status: 'available' as any,
              purchaseDate: new Date('2023-01-15'),
              purchasePrice: 15000,
              currentValue: 12000,
              location: 'Инструментальная',
              zone: 'И-1',
              maintenanceInterval: 180,
              usageHours: 120,
              isActive: true,
              notes: 'Состояние хорошее',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
          
          set(state => {
            state.tools = mockTools;
            state.loading = false;
          });
        } catch (error) {
          set(state => { state.loading = false; });
        }
      },
      fetchEquipment: async () => {
        // Реализация загрузки оборудования
      },
      createTool: async (tool) => {
        const newTool: Tool = {
          ...tool,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set(state => {
          state.tools.push(newTool);
        });
      },
      updateTool: async (id, updates) => {
        set(state => {
          const index = state.tools.findIndex((t: Tool) => t.id === id);
          if (index !== -1) {
            Object.assign(state.tools[index], updates, { updatedAt: new Date() });
          }
        });
      },
      deleteTool: async (id) => {
        set(state => {
          state.tools = state.tools.filter((t: Tool) => t.id !== id);
        });
      },
      createEquipment: async (equipment) => {
        // Реализация создания оборудования
      },
      updateEquipment: async (id, updates) => {
        // Реализация обновления оборудования
      },
      assignTool: async (toolId, userId) => {
        set(state => {
          const tool = state.tools.find((t: Tool) => t.id === toolId);
          if (tool) {
            tool.assignedTo = userId;
            tool.status = 'in_use' as any;
            tool.updatedAt = new Date();
          }
        });
      },
      returnTool: async (toolId) => {
        set(state => {
          const tool = state.tools.find((t: Tool) => t.id === toolId);
          if (tool) {
            tool.assignedTo = undefined;
            tool.status = 'available' as any;
            tool.updatedAt = new Date();
          }
        });
      },
    }))
  )
);

// Store для дашборда
export const useDashboardStore = create<DashboardState>()(
  devtools(
    immer((set, get) => ({
      stats: null,
      loading: false as boolean,
      weather: null,
      fetchStats: async () => {
        set(state => { state.loading = true; });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const mockStats: DashboardStats = {
            totalProjects: 12,
            activeProjects: 8,
            completedProjects: 4,
            onHoldProjects: 0,
            totalRevenue: 120000000,
            monthlyRevenue: 8500000,
            totalExpenses: 95000000,
            monthlyExpenses: 6200000,
            profit: 25000000,
            profitMargin: 20.8,
            employeeCount: 45,
            activeEmployees: 43,
            materialCount: 1250,
            lowStockMaterials: 8,
            toolCount: 180,
            brokenTools: 3,
            toolsInMaintenance: 5,
            pendingInvoices: 12,
            overdueInvoices: 2,
            cashFlow: 2300000,
            projectsOnSchedule: 6,
            projectsDelayed: 2,
            averageProjectDuration: 8.5,
            clientSatisfactionScore: 4.7,
            safetyIncidentsThisMonth: 1,
            qualityScore: 92,
            utilizationRate: 85,
          };
          
          set(state => {
            state.stats = mockStats;
            state.loading = false;
          });
        } catch (error) {
          set(state => { state.loading = false; });
        }
      },
      fetchWeather: async (location: string) => {
        try {
          const mockWeather: WeatherForecast = {
            id: '1',
            location,
            date: new Date(),
            temperature: { min: -2, max: 5 },
            humidity: 65,
            windSpeed: 8,
            precipitation: 20,
            condition: 'cloudy',
            visibility: 10,
            uvIndex: 2,
            workRecommendation: 'good',
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          set(state => {
            state.weather = mockWeather;
          });
        } catch (error) {
          console.error('Failed to fetch weather:', error);
        }
      },
    }))
  )
);

// Store для уведомлений
export const useNotificationStore = create<NotificationState>()(
  devtools(
    immer((set, get) => ({
      notifications: [],
      unreadCount: 0,
      fetchNotifications: async () => {
        // Симуляция загрузки уведомлений
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockNotifications: Notification[] = [
          {
            id: '1',
            userId: '1',
            title: 'Низкий запас материалов',
            message: 'Цемент М400 заканчивается на складе',
            type: 'warning' as any,
            category: 'inventory',
            isRead: false,
            priority: 'medium',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          },
          {
            id: '2',
            userId: '1',
            title: 'Задача завершена',
            message: 'Завершена задача "Подготовка котлована" в проекте "Солнечный"',
            type: 'success' as any,
            category: 'project',
            isRead: false,
            priority: 'low',
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          },
        ];
        
        set(state => {
          state.notifications = mockNotifications;
          state.unreadCount = mockNotifications.filter(n => !n.isRead).length;
        });
      },
      markAsRead: (id: string) => {
        set(state => {
          const notification = state.notifications.find((n: Notification) => n.id === id);
          if (notification && !notification.isRead) {
            notification.isRead = true;
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        });
      },
      markAllAsRead: () => {
        set(state => {
          state.notifications.forEach((n: Notification) => n.isRead = true);
          state.unreadCount = 0;
        });
      },
      deleteNotification: (id: string) => {
        set(state => {
          const index = state.notifications.findIndex((n: Notification) => n.id === id);
          if (index !== -1) {
            const notification = state.notifications[index];
            if (!notification.isRead) {
              state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
            state.notifications.splice(index, 1);
          }
        });
      },
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString(),
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set(state => {
          state.notifications.unshift(newNotification);
          state.unreadCount += 1;
        });
      },
    }))
  )
);

// Store для общего состояния приложения
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer((set, get) => ({
        settings: {
          companyName: 'СтройТех Про',
          companyLogo: '',
          companyAddress: 'г. Москва, ул. Строительная, 25',
          companyPhone: '+7 (495) 123-45-67',
          companyEmail: 'info@stroyteh.ru',
          companyWebsite: 'https://stroyteh.ru',
          inn: '7701234567',
          kpp: '770101001',
          currency: 'RUB',
          timezone: 'Europe/Moscow',
          language: 'ru',
          dateFormat: 'DD.MM.YYYY',
          theme: 'light',
          workingHours: {
            start: '08:00',
            end: '18:00',
            lunchStart: '12:00',
            lunchEnd: '13:00',
          },
          workingDays: [1, 2, 3, 4, 5],
          notifications: {
            email: true,
            push: true,
            sms: false,
            lowStock: true,
            projectDeadlines: true,
            maintenanceReminders: true,
            safetyAlerts: true,
            qualityIssues: true,
            budgetOverruns: true,
            overdueInvoices: true,
          },
          security: {
            passwordPolicy: {
              minLength: 8,
              requireUppercase: true,
              requireLowercase: true,
              requireNumbers: true,
              requireSpecialChars: false,
            },
            sessionTimeout: 480,
            twoFactorEnabled: false,
          },
          integrations: {
            maps: true,
            weather: true,
            accounting: false,
            banking: false,
            email: true,
            sms: false,
          },
          backups: {
            autoBackup: true,
            frequency: 'daily',
            retention: 30,
          },
        },
        theme: 'light',
        sidebar: {
          isOpen: true,
          isPinned: true,
        },
        updateSettings: (updates) => {
          set(state => {
            Object.assign(state.settings, updates);
          });
        },
        toggleTheme: () => {
          set(state => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
            state.settings.theme = state.theme;
          });
        },
        toggleSidebar: () => {
          set(state => {
            state.sidebar.isOpen = !state.sidebar.isOpen;
          });
        },
        pinSidebar: (pinned) => {
          set(state => {
            state.sidebar.isPinned = pinned;
          });
        },
      })),
      { name: 'app-store' }
    )
  )
);

// Дополнительные stores для других модулей
export const useHRStore = create<HRState>()(devtools(immer(() => ({
  employees: [] as User[],
  timeEntries: [] as TimeEntry[],
  trainings: [] as Training[],
  loading: false as boolean,
  fetchEmployees: async () => {},
  fetchTimeEntries: async () => {},
  fetchTrainings: async () => {},
  createEmployee: async (_employee: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {},
  updateEmployee: async (_id: string, _updates: Partial<User>) => {},
  deleteEmployee: async (_id: string) => {},
  createTimeEntry: async (_entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>) => {},
  approveTimeEntry: async (_id: string) => {},
  rejectTimeEntry: async (_id: string, _reason: string) => {},
  createTraining: async (_training: Omit<Training, 'id' | 'createdAt' | 'updatedAt'>) => {},
  enrollInTraining: async (_trainingId: string, _userId: string) => {},
}))));

export const useFinanceStore = create<FinanceState>()(devtools(immer(() => ({
  invoices: [] as Invoice[],
  budgets: [] as Budget[],
  contracts: [] as Contract[],
  loading: false as boolean,
  fetchInvoices: async () => {},
  fetchBudgets: async () => {},
  fetchContracts: async () => {},
  createInvoice: async (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {},
  updateInvoiceStatus: async (id: string, status: string) => {},
  createBudget: async (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {},
  updateBudget: async (id: string, updates: Partial<Budget>) => {},
  createContract: async (contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => {},
}))));

export const useClientStore = create<ClientState>()(devtools(immer(() => ({
  clients: [] as Client[],
  loading: false as boolean,
  fetchClients: async () => {},
  createClient: async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {},
  updateClient: async (id: string, updates: Partial<Client>) => {},
  deleteClient: async (id: string) => {},
}))));

export const useSafetyStore = create<SafetyState>()(devtools(immer(() => ({
  incidents: [] as SafetyIncident[],
  loading: false as boolean,
  fetchIncidents: async () => {},
  createIncident: async (incident: Omit<SafetyIncident, 'id' | 'createdAt' | 'updatedAt'>) => {},
  updateIncident: async (id: string, updates: Partial<SafetyIncident>) => {},
  resolveIncident: async (id: string, resolution: string) => {},
}))));

export const useQualityStore = create<QualityState>()(devtools(immer(() => ({
  checks: [] as QualityCheck[],
  loading: false as boolean,
  fetchQualityChecks: async () => {},
  createQualityCheck: async (check: Omit<QualityCheck, 'id' | 'createdAt' | 'updatedAt'>) => {},
  updateQualityCheck: async (id: string, updates: Partial<QualityCheck>) => {},
}))));

export const useCalendarStore = create<CalendarState>()(devtools(immer(() => ({
  events: [] as CalendarEvent[],
  loading: false as boolean,
  fetchEvents: async () => {},
  createEvent: async (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {},
  updateEvent: async (id: string, updates: Partial<CalendarEvent>) => {},
  deleteEvent: async (id: string) => {},
}))));

export const useReportStore = create<ReportState>()(devtools(immer(() => ({
  reports: [] as Report[],
  templates: [] as Template[],
  loading: false as boolean,
  fetchReports: async () => {},
  fetchTemplates: async () => {},
  generateReport: async (reportId: string, parameters: Record<string, any>) => {},
  createTemplate: async (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => {},
  updateTemplate: async (id: string, updates: Partial<Template>) => {},
}))));

export const useIntegrationStore = create<IntegrationState>()(devtools(immer(() => ({
  integrations: [] as Integration[],
  backups: [] as Backup[],
  loading: false as boolean,
  fetchIntegrations: async () => {},
  fetchBackups: async () => {},
  enableIntegration: async (type: string, config: Record<string, any>) => {},
  disableIntegration: async (id: string) => {},
  syncIntegration: async (id: string) => {},
  createBackup: async (name: string, type: 'manual' | 'automatic') => {},
  restoreBackup: async (id: string) => {},
}))));