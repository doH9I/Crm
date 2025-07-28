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
  currentProjectId: string | null; // ID текущего выбранного проекта
  isAllProjectsView: boolean; // Флаг для отображения всех проектов
  fetchProjects: () => Promise<void>;
  fetchProjectTasks: (projectId: string) => Promise<void>;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  selectProject: (project: Project | null) => void;
  setCurrentProjectId: (projectId: string | null) => void;
  setAllProjectsView: (isAllProjects: boolean) => void;
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
  fetchMaterials: (projectId?: string) => Promise<void>;
  fetchSuppliers: (projectId?: string) => Promise<void>;
  fetchOrders: (projectId?: string) => Promise<void>;
  createMaterial: (material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMaterial: (id: string, updates: Partial<Material>) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
  createSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSupplier: (id: string, updates: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  createOrder: (order: Omit<MaterialOrder, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
}

// Интерфейс для состояния инструментов и оборудования
interface ToolState {
  tools: Tool[];
  equipment: Equipment[];
  loading: boolean;
  fetchTools: (projectId?: string) => Promise<void>;
  fetchEquipment: (projectId?: string) => Promise<void>;
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
  fetchEmployees: (projectId?: string) => Promise<void>;
  fetchTimeEntries: (projectId?: string) => Promise<void>;
  fetchTrainings: (projectId?: string) => Promise<void>;
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
  fetchInvoices: (projectId?: string) => Promise<void>;
  fetchBudgets: (projectId?: string) => Promise<void>;
  fetchContracts: (projectId?: string) => Promise<void>;
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
  fetchClients: (projectId?: string) => Promise<void>;
  createClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
}

// Интерфейс для состояния безопасности
interface SafetyState {
  incidents: SafetyIncident[];
  loading: boolean;
  fetchIncidents: (projectId?: string) => Promise<void>;
  createIncident: (incident: Omit<SafetyIncident, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateIncident: (id: string, updates: Partial<SafetyIncident>) => Promise<void>;
  resolveIncident: (id: string, resolution: string) => Promise<void>;
}

// Интерфейс для состояния качества
interface QualityState {
  checks: QualityCheck[];
  loading: boolean;
  fetchQualityChecks: (projectId?: string) => Promise<void>;
  createQualityCheck: (check: Omit<QualityCheck, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateQualityCheck: (id: string, updates: Partial<QualityCheck>) => Promise<void>;
}

// Интерфейс для состояния календаря
interface CalendarState {
  events: CalendarEvent[];
  loading: boolean;
  fetchEvents: (projectId?: string) => Promise<void>;
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
      currentProjectId: null, // ID текущего выбранного проекта
      isAllProjectsView: false, // Флаг для отображения всех проектов
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
              description: 'Строительство торгового центра площадью 25,000 м²',
              client: 'ООО "ТоргСтрой"',
              clientContact: 'Петров П.П.',
              clientPhone: '+7 (999) 234-56-78',
              clientEmail: 'petrov@torgstroy.ru',
              address: 'г. Санкт-Петербург, пр. Невский, 100',
              status: 'planning' as any,
              type: 'commercial' as any,
              startDate: new Date('2024-03-01'),
              endDate: new Date('2025-06-30'),
              plannedEndDate: new Date('2025-06-01'),
              budget: 80000000,
              spentAmount: 5000000,
              approvedBudget: 85000000,
              contingencyFund: 5000000,
              managerId: '2',
              architectId: '3',
              engineerId: '4',
              teamMembers: ['2', '3', '4', '5', '6'],
              progress: 15,
              priority: 'medium',
              notes: 'Проект в стадии планирования',
              riskLevel: 'low',
              weatherSensitive: false,
              safetyRequirements: ['Строительные каски', 'Ограждения'],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '3',
              name: 'Промышленный комплекс "ТехноПарк"',
              description: 'Строительство промышленного комплекса для производства',
              client: 'ООО "ПромСтрой"',
              clientContact: 'Сидоров С.С.',
              clientPhone: '+7 (999) 345-67-89',
              clientEmail: 'sidorov@promstroy.ru',
              address: 'г. Екатеринбург, ул. Промышленная, 50',
              status: 'completed' as any,
              type: 'industrial' as any,
              startDate: new Date('2023-06-01'),
              endDate: new Date('2024-02-28'),
              plannedEndDate: new Date('2024-03-01'),
              budget: 120000000,
              spentAmount: 118000000,
              approvedBudget: 125000000,
              contingencyFund: 5000000,
              managerId: '1',
              architectId: '2',
              engineerId: '3',
              teamMembers: ['1', '2', '3', '4', '5', '6', '7'],
              progress: 100,
              priority: 'high',
              notes: 'Проект успешно завершен',
              riskLevel: 'low',
              weatherSensitive: true,
              safetyRequirements: ['Спецодежда', 'Защитные очки', 'Респираторы'],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '4',
              name: 'Мостовой переход через реку',
              description: 'Строительство автомобильного моста длиной 500м',
              client: 'ГУП "ДорСтрой"',
              clientContact: 'Козлов К.К.',
              clientPhone: '+7 (999) 456-78-90',
              clientEmail: 'kozlov@dorstroy.ru',
              address: 'г. Новосибирск, р. Обь',
              status: 'in_progress' as any,
              type: 'infrastructure' as any,
              startDate: new Date('2024-02-01'),
              endDate: new Date('2025-08-31'),
              plannedEndDate: new Date('2025-08-01'),
              budget: 200000000,
              spentAmount: 75000000,
              approvedBudget: 210000000,
              contingencyFund: 10000000,
              managerId: '3',
              architectId: '4',
              engineerId: '5',
              teamMembers: ['3', '4', '5', '6', '7', '8'],
              progress: 35,
              priority: 'critical',
              notes: 'Критически важный объект инфраструктуры',
              riskLevel: 'high',
              weatherSensitive: true,
              safetyRequirements: ['Страховочные пояса', 'Защитные каски', 'Спасательные жилеты'],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '5',
              name: 'Реконструкция исторического здания',
              description: 'Реставрация и реконструкция здания XIX века',
              client: 'ООО "Реставрация"',
              clientContact: 'Морозов М.М.',
              clientPhone: '+7 (999) 567-89-01',
              clientEmail: 'morozov@restoration.ru',
              address: 'г. Казань, ул. Баумана, 10',
              status: 'on_hold' as any,
              type: 'renovation' as any,
              startDate: new Date('2024-01-01'),
              endDate: new Date('2024-12-31'),
              plannedEndDate: new Date('2024-11-30'),
              budget: 35000000,
              spentAmount: 15000000,
              approvedBudget: 36000000,
              contingencyFund: 1000000,
              managerId: '2',
              architectId: '3',
              engineerId: '4',
              teamMembers: ['2', '3', '4', '5'],
              progress: 40,
              priority: 'medium',
              notes: 'Проект приостановлен из-за согласований',
              riskLevel: 'medium',
              weatherSensitive: false,
              safetyRequirements: ['Защитные каски', 'Спецодежда'],
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
        });
      },
      setCurrentProjectId: (projectId) => {
        set(state => {
          state.currentProjectId = projectId;
        });
      },
      setAllProjectsView: (isAllProjects) => {
        set(state => {
          state.isAllProjectsView = isAllProjects;
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
      fetchMaterials: async (projectId?: string) => {
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
            {
              id: '2',
              name: 'Арматура А500С',
              description: 'Арматурная сталь класса А500С',
              category: 'Металлопрокат',
              subcategory: 'Арматура',
              sku: 'ARM-A500C-12',
              unit: 'тонна',
              currentStock: 25,
              reservedStock: 5,
              availableStock: 20,
              minStock: 10,
              maxStock: 50,
              reorderPoint: 15,
              unitPrice: 45000,
              avgPrice: 44000,
              lastPurchasePrice: 45000,
              supplier: 'ООО МеталлСтрой',
              location: 'Склад Б',
              zone: 'Б1',
              shelf: 'Б1-02',
              isActive: true,
              isHazardous: false,
              weight: 1000,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '3',
              name: 'Кирпич керамический',
              description: 'Кирпич керамический полнотелый М150',
              category: 'Стеновые материалы',
              subcategory: 'Кирпич',
              sku: 'KIR-M150-250',
              unit: 'штука',
              currentStock: 50000,
              reservedStock: 5000,
              availableStock: 45000,
              minStock: 10000,
              maxStock: 100000,
              reorderPoint: 15000,
              unitPrice: 12,
              avgPrice: 11.5,
              lastPurchasePrice: 12,
              supplier: 'ООО КирпичЗавод',
              location: 'Склад В',
              zone: 'В1',
              shelf: 'В1-03',
              isActive: true,
              isHazardous: false,
              weight: 3.5,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
          
          // Фильтруем материалы по проекту, если указан
          const filteredMaterials = projectId 
            ? mockMaterials.filter(material => {
                // В реальном приложении здесь была бы связь с проектом
                // Пока что показываем все материалы для демонстрации
                return true;
              })
            : mockMaterials;
          
          set(state => {
            state.materials = filteredMaterials;
            state.loading = false;
          });
        } catch (error) {
          set(state => { state.loading = false; });
        }
      },
      fetchSuppliers: async (projectId?: string) => {
        // Реализация загрузки поставщиков с фильтрацией по проекту
        set(state => { state.loading = true; });
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          const mockSuppliers: Supplier[] = [
            {
              id: '1',
              name: 'ООО Цементторг',
              contactPerson: 'Иванов И.И.',
              email: 'ivanov@cement.ru',
              phone: '+7 (999) 111-22-33',
              address: 'г. Москва, ул. Строительная, 1',
              website: 'www.cement.ru',
              inn: '1234567890',
              kpp: '123456789',
              paymentTerms: '30 дней',
              deliveryTerms: 'Самовывоз',
              rating: 4.5,
              isActive: true,
              categories: ['Сухие смеси', 'Цемент'],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '2',
              name: 'ООО МеталлСтрой',
              contactPerson: 'Петров П.П.',
              email: 'petrov@metal.ru',
              phone: '+7 (999) 222-33-44',
              address: 'г. Санкт-Петербург, ул. Металлическая, 2',
              website: 'www.metal.ru',
              inn: '0987654321',
              kpp: '098765432',
              paymentTerms: '14 дней',
              deliveryTerms: 'Доставка',
              rating: 4.8,
              isActive: true,
              categories: ['Металлопрокат', 'Арматура'],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
          
          set(state => {
            state.suppliers = mockSuppliers;
            state.loading = false;
          });
        } catch (error) {
          set(state => { state.loading = false; });
        }
      },
      fetchOrders: async (projectId?: string) => {
        // Реализация загрузки заказов с фильтрацией по проекту
        set(state => { state.loading = true; });
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          const mockOrders: MaterialOrder[] = [
            {
              id: '1',
              orderNumber: 'ORD-001',
              supplierId: '1',
              projectId: projectId || '1',
              items: [],
              totalAmount: 50000,
              status: 'confirmed',
              orderDate: new Date(),
              expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              urgentOrder: false,
              deliveryAddress: 'г. Москва, ул. Строительная, 15',
              createdBy: '1',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
          
          set(state => {
            state.orders = mockOrders;
            state.loading = false;
          });
        } catch (error) {
          set(state => { state.loading = false; });
        }
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
      updateSupplier: async (id, updates) => {
        // Реализация обновления поставщика
      },
      deleteSupplier: async (id) => {
        // Реализация удаления поставщика
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
      fetchTools: async (projectId?: string) => {
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
            {
              id: '2',
              name: 'Перфоратор Bosch GBH 2-26',
              category: 'Электроинструмент',
              subcategory: 'Перфораторы',
              brand: 'Bosch',
              model: 'GBH 2-26',
              inventoryNumber: 'TOOL-002',
              condition: 'excellent' as any,
              status: 'in_use' as any,
              purchaseDate: new Date('2023-03-10'),
              purchasePrice: 25000,
              currentValue: 22000,
              location: 'Объект №1',
              zone: 'О-1',
              maintenanceInterval: 180,
              usageHours: 80,
              isActive: true,
              notes: 'Используется на объекте',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '3',
              name: 'Бетономешалка 130л',
              category: 'Строительное оборудование',
              subcategory: 'Бетономешалки',
              brand: 'Строймаш',
              model: 'БМ-130',
              inventoryNumber: 'TOOL-003',
              condition: 'good' as any,
              status: 'maintenance' as any,
              purchaseDate: new Date('2022-08-20'),
              purchasePrice: 35000,
              currentValue: 28000,
              location: 'Склад',
              zone: 'С-1',
              maintenanceInterval: 90,
              usageHours: 200,
              isActive: true,
              notes: 'Требует обслуживания',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
          
          // Фильтруем инструменты по проекту, если указан
          const filteredTools = projectId 
            ? mockTools.filter(tool => {
                // В реальном приложении здесь была бы связь с проектом
                // Пока что показываем все инструменты для демонстрации
                return true;
              })
            : mockTools;
          
          set(state => {
            state.tools = filteredTools;
            state.loading = false;
          });
        } catch (error) {
          set(state => { state.loading = false; });
        }
      },
      fetchEquipment: async (projectId?: string) => {
        // Реализация загрузки оборудования с фильтрацией по проекту
        set(state => { state.loading = true; });
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          const mockEquipment: Equipment[] = [
            {
              id: '1',
              name: 'Экскаватор JCB 3CX',
              type: 'excavator',
              brand: 'JCB',
              model: '3CX',
              year: 2020,
              serialNumber: 'JCB-2020-001',
              licensePlate: 'А123БВ77',
              status: 'available' as any,
              location: 'Объект №1',
              operatorId: '1',
              fuelLevel: 85,
              mileage: 2500,
              engineHours: 1200,
              lastService: new Date('2024-01-15'),
              nextService: new Date('2024-04-15'),
              insurance: {
                provider: 'Росгосстрах',
                policyNumber: 'INS-001',
                expiryDate: new Date('2024-12-31'),
              },
              documents: [],
              maintenanceLog: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
          
          set(state => {
            state.equipment = mockEquipment;
            state.loading = false;
          });
        } catch (error) {
          set(state => { state.loading = false; });
        }
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
            maxLoginAttempts: 5,
            twoFactorRequired: false,
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
export const useHRStore = create<HRState>()(devtools(immer((set, get) => ({
  employees: [] as User[],
  timeEntries: [] as TimeEntry[],
  trainings: [] as Training[],
  loading: false as boolean,
  fetchEmployees: async (projectId?: string) => {
    set(state => { state.loading = true; });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockEmployees: User[] = [
        {
          id: '1',
          email: 'ivanov@company.ru',
          name: 'Иванов Иван Иванович',
          role: UserRole.FOREMAN,
          avatar: '',
          isActive: true,
          department: 'Строительный отдел',
          position: 'Прораб',
          phone: '+7 (999) 123-45-67',
          salary: 80000,
          hireDate: new Date('2022-03-15'),
          skills: ['Строительство', 'Управление бригадой', 'Чтение чертежей'],
          lastLogin: new Date(),
          permissions: ['projects', 'employees', 'materials'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          email: 'petrov@company.ru',
          name: 'Петров Петр Петрович',
          role: UserRole.WORKER,
          avatar: '',
          isActive: true,
          department: 'Строительный отдел',
          position: 'Каменщик',
          phone: '+7 (999) 234-56-78',
          salary: 60000,
          hireDate: new Date('2023-01-10'),
          skills: ['Кладка кирпича', 'Работа с раствором'],
          lastLogin: new Date(),
          permissions: ['projects'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          email: 'sidorov@company.ru',
          name: 'Сидоров Сидор Сидорович',
          role: UserRole.WORKER,
          avatar: '',
          isActive: true,
          department: 'Строительный отдел',
          position: 'Плотник',
          phone: '+7 (999) 345-67-89',
          salary: 65000,
          hireDate: new Date('2022-08-20'),
          skills: ['Плотницкие работы', 'Обработка дерева'],
          lastLogin: new Date(),
          permissions: ['projects'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      // Фильтруем сотрудников по проекту, если указан
      const filteredEmployees = projectId 
        ? mockEmployees.filter(employee => {
            // В реальном приложении здесь была бы связь с проектом
            // Пока что показываем всех сотрудников для демонстрации
            return true;
          })
        : mockEmployees;
      
      set(state => {
        state.employees = filteredEmployees;
        state.loading = false;
      });
    } catch (error) {
      set(state => { state.loading = false; });
    }
  },
  fetchTimeEntries: async (projectId?: string) => {
    // Реализация загрузки учета времени с фильтрацией по проекту
  },
  fetchTrainings: async (projectId?: string) => {
    // Реализация загрузки обучения с фильтрацией по проекту
  },
  createEmployee: async (employee: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEmployee: User = {
      ...employee,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set(state => {
      state.employees.push(newEmployee);
    });
  },
  updateEmployee: async (id: string, updates: Partial<User>) => {
    set(state => {
      const index = state.employees.findIndex((e: User) => e.id === id);
      if (index !== -1) {
        Object.assign(state.employees[index], updates, { updatedAt: new Date() });
      }
    });
  },
  deleteEmployee: async (id: string) => {
    set(state => {
      state.employees = state.employees.filter((e: User) => e.id !== id);
    });
  },
  createTimeEntry: async (entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Реализация создания записи времени
  },
  approveTimeEntry: async (id: string) => {
    // Реализация одобрения записи времени
  },
  rejectTimeEntry: async (id: string, reason: string) => {
    // Реализация отклонения записи времени
  },
  createTraining: async (training: Omit<Training, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Реализация создания обучения
  },
  enrollInTraining: async (trainingId: string, userId: string) => {
    // Реализация записи на обучение
  },
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