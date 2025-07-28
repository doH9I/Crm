import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import {
  User,
  UserRole,
  Project,
  Material,
  Tool,
  DashboardStats,
  Notification,
  AppSettings,
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
  loading: boolean;
  selectedProject: Project | null;
  fetchProjects: () => Promise<void>;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  selectProject: (project: Project) => void;
}

// Интерфейс для состояния выбранного проекта
interface ProjectFilterState {
  selectedProjectId: string | null;
  setSelectedProject: (projectId: string | null) => void;
  getFilteredData: <T extends { projectId?: string }>(data: T[]) => T[];
  getProjectById: (id: string) => Project | undefined;
}

// Интерфейс для состояния материалов
interface MaterialState {
  materials: Material[];
  loading: boolean;
  fetchMaterials: () => Promise<void>;
  createMaterial: (material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMaterial: (id: string, updates: Partial<Material>) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
}

// Интерфейс для состояния инструментов
interface ToolState {
  tools: Tool[];
  loading: boolean;
  fetchTools: () => Promise<void>;
  createTool: (tool: Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTool: (id: string, updates: Partial<Tool>) => Promise<void>;
  deleteTool: (id: string) => Promise<void>;
  assignTool: (toolId: string, userId: string) => Promise<void>;
  returnTool: (toolId: string) => Promise<void>;
}

// Интерфейс для состояния дашборда
interface DashboardState {
  stats: DashboardStats | null;
  loading: boolean;
  fetchStats: () => Promise<void>;
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
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        login: async (email: string, password: string) => {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const users = [
            {
              id: '1',
              email: 'admin@construction-crm.ru',
              password: 'admin123',
              name: 'Главный Администратор',
              role: UserRole.ADMIN,
              avatar: '',
              isActive: true,
              permissions: ['*'],
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
            
            set({ user, isAuthenticated: true });
            return true;
          }
          return false;
        },
        logout: () => {
          set({ user: null, isAuthenticated: false });
        },
        updateProfile: (updates: Partial<User>) => {
          const { user } = get();
          if (user) {
            set({ user: { ...user, ...updates } });
          }
        },
      }),
      { 
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);

// Store для фильтрации по проектам
export const useProjectFilterStore = create<ProjectFilterState>()(
  devtools(
    persist(
      (set, get) => ({
        selectedProjectId: null,
        setSelectedProject: (projectId: string | null) => {
          set({ selectedProjectId: projectId });
        },
        getFilteredData: <T extends { projectId?: string }>(data: T[]): T[] => {
          const { selectedProjectId } = get();
          if (!selectedProjectId) {
            return data;
          }
          return data.filter(item => item.projectId === selectedProjectId);
        },
        getProjectById: (id: string) => {
          const { projects } = useProjectStore.getState();
          return projects.find(p => p.id === id);
        },
      }),
      { 
        name: 'project-filter-store',
        partialize: (state) => ({
          selectedProjectId: state.selectedProjectId,
        }),
      }
    )
  )
);

// Store для проектов
export const useProjectStore = create<ProjectState>()(
  devtools(
    (set, get) => ({
      projects: [],
      loading: false,
      selectedProject: null,
      fetchProjects: async () => {
        set({ loading: true });
        try {
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
              name: 'Торговый центр "Атриум"',
              description: 'Строительство торгового центра площадью 15,000 м²',
              client: 'ООО "Ритейл Девелопмент"',
              clientContact: 'Петров П.П.',
              clientPhone: '+7 (499) 234-56-78',
              clientEmail: 'petrov@retail-dev.ru',
              address: 'г. Санкт-Петербург, Невский пр., 100',
              status: 'planning' as any,
              type: 'commercial' as any,
              startDate: new Date('2024-03-01'),
              endDate: new Date('2025-02-28'),
              plannedEndDate: new Date('2025-02-15'),
              budget: 120000000,
              spentAmount: 5000000,
              approvedBudget: 125000000,
              contingencyFund: 5000000,
              managerId: '2',
              architectId: '3',
              engineerId: '4',
              teamMembers: ['2', '3', '4', '6', '7'],
              progress: 10,
              priority: 'high',
              notes: 'На стадии проектирования',
              riskLevel: 'medium',
              weatherSensitive: false,
              safetyRequirements: ['Защитные каски', 'Страховочные пояса', 'Защитная обувь'],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '3',
              name: 'Промышленный склад "Логистик"',
              description: 'Строительство складского комплекса с автоматизированной системой',
              client: 'ЗАО "Логистические решения"',
              clientContact: 'Сидоров С.С.',
              clientPhone: '+7 (812) 345-67-89',
              clientEmail: 'sidorov@logistics.ru',
              address: 'г. Екатеринбург, Промзона "Восток"',
              status: 'in_progress' as any,
              type: 'industrial' as any,
              startDate: new Date('2023-11-01'),
              endDate: new Date('2024-08-31'),
              plannedEndDate: new Date('2024-08-15'),
              budget: 80000000,
              spentAmount: 60000000,
              approvedBudget: 82000000,
              contingencyFund: 2000000,
              managerId: '3',
              architectId: '4',
              engineerId: '5',
              teamMembers: ['3', '4', '5', '8', '9'],
              progress: 75,
              priority: 'medium',
              notes: 'Близится к завершению',
              riskLevel: 'low',
              weatherSensitive: true,
              safetyRequirements: ['Защитные каски', 'Страховочные пояса', 'Респираторы'],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '4',
              name: 'Офисное здание "Бизнес Плаза"',
              description: 'Строительство многофункционального офисного центра класса А',
              client: 'ООО "Корпоративная недвижимость"',
              clientContact: 'Козлов К.К.',
              clientPhone: '+7 (495) 456-78-90',
              clientEmail: 'kozlov@corp-real.ru',
              address: 'г. Москва, ул. Деловая, 42',
              status: 'planning' as any,
              type: 'commercial' as any,
              startDate: new Date('2024-05-01'),
              endDate: new Date('2025-10-31'),
              plannedEndDate: new Date('2025-10-15'),
              budget: 200000000,
              spentAmount: 0,
              approvedBudget: 205000000,
              contingencyFund: 15000000,
              managerId: '1',
              architectId: '2',
              engineerId: '3',
              teamMembers: ['1', '2', '3'],
              progress: 5,
              priority: 'high',
              notes: 'Получение разрешений',
              riskLevel: 'medium',
              weatherSensitive: false,
              safetyRequirements: ['Защитные каски', 'Страховочные пояса'],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '5',
              name: 'Реконструкция исторического здания',
              description: 'Реставрация и модернизация здания XIX века',
              client: 'Министерство культуры',
              clientContact: 'Федоров Ф.Ф.',
              clientPhone: '+7 (495) 567-89-01',
              clientEmail: 'fedorov@culture.gov.ru',
              address: 'г. Санкт-Петербург, наб. Фонтанки, 25',
              status: 'completed' as any,
              type: 'renovation' as any,
              startDate: new Date('2023-04-01'),
              endDate: new Date('2024-01-31'),
              plannedEndDate: new Date('2024-01-15'),
              budget: 35000000,
              spentAmount: 34500000,
              approvedBudget: 35000000,
              contingencyFund: 1500000,
              managerId: '2',
              architectId: '5',
              engineerId: '6',
              teamMembers: ['2', '5', '6', '10'],
              progress: 100,
              priority: 'medium',
              notes: 'Проект успешно завершен',
              riskLevel: 'low',
              weatherSensitive: true,
              safetyRequirements: ['Защитные каски', 'Страховочные пояса', 'Специальная обувь'],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
          
          set({ projects: mockProjects, loading: false });
        } catch (error) {
          set({ loading: false });
        }
      },
      createProject: async (project) => {
        const newProject: Project = {
          ...project,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        const { projects } = get();
        set({ projects: [...projects, newProject] });
      },
      updateProject: async (id, updates) => {
        const { projects } = get();
        const index = projects.findIndex(p => p.id === id);
        if (index !== -1) {
          const updatedProjects = [...projects];
          updatedProjects[index] = { ...updatedProjects[index], ...updates, updatedAt: new Date() };
          set({ projects: updatedProjects });
        }
      },
      deleteProject: async (id) => {
        const { projects } = get();
        set({ projects: projects.filter(p => p.id !== id) });
      },
      selectProject: (project) => {
        set({ selectedProject: project });
      },
    })
  )
);

// Store для материалов
export const useMaterialStore = create<MaterialState>()(
  devtools(
    (set, get) => ({
      materials: [],
      loading: false,
      fetchMaterials: async () => {
        set({ loading: true });
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
              name: 'Кирпич облицовочный',
              description: 'Кирпич керамический лицевой',
              category: 'Стеновые материалы',
              subcategory: 'Кирпич',
              sku: 'BRK-OBL-250',
              unit: 'шт',
              currentStock: 5000,
              reservedStock: 1000,
              availableStock: 4000,
              minStock: 500,
              maxStock: 10000,
              reorderPoint: 800,
              unitPrice: 45,
              avgPrice: 43,
              lastPurchasePrice: 45,
              supplier: 'Кирпичный завод №1',
              location: 'Склад Б',
              zone: 'Б2',
              shelf: 'Б2-05',
              isActive: true,
              isHazardous: false,
              weight: 2.5,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '3',
              name: 'Арматура А500С',
              description: 'Арматура стальная рифленая',
              category: 'Металлоконструкции',
              subcategory: 'Арматура',
              sku: 'ARM-A500-12',
              unit: 'м',
              currentStock: 2000,
              reservedStock: 500,
              availableStock: 1500,
              minStock: 200,
              maxStock: 5000,
              reorderPoint: 300,
              unitPrice: 65,
              avgPrice: 62,
              lastPurchasePrice: 65,
              supplier: 'МеталлТорг',
              location: 'Склад В',
              zone: 'В1',
              shelf: 'В1-01',
              isActive: true,
              isHazardous: false,
              weight: 0.888,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
          
          set({ materials: mockMaterials, loading: false });
        } catch (error) {
          set({ loading: false });
        }
      },
      createMaterial: async (material) => {
        const newMaterial: Material = {
          ...material,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        const { materials } = get();
        set({ materials: [...materials, newMaterial] });
      },
      updateMaterial: async (id, updates) => {
        const { materials } = get();
        const index = materials.findIndex(m => m.id === id);
        if (index !== -1) {
          const updatedMaterials = [...materials];
          updatedMaterials[index] = { ...updatedMaterials[index], ...updates, updatedAt: new Date() };
          set({ materials: updatedMaterials });
        }
      },
      deleteMaterial: async (id) => {
        const { materials } = get();
        set({ materials: materials.filter(m => m.id !== id) });
      },
    })
  )
);

// Store для инструментов
export const useToolStore = create<ToolState>()(
  devtools(
    (set, get) => ({
      tools: [],
      loading: false,
      fetchTools: async () => {
        set({ loading: true });
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
          
          set({ tools: mockTools, loading: false });
        } catch (error) {
          set({ loading: false });
        }
      },
      createTool: async (tool) => {
        const newTool: Tool = {
          ...tool,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        const { tools } = get();
        set({ tools: [...tools, newTool] });
      },
      updateTool: async (id, updates) => {
        const { tools } = get();
        const index = tools.findIndex(t => t.id === id);
        if (index !== -1) {
          const updatedTools = [...tools];
          updatedTools[index] = { ...updatedTools[index], ...updates, updatedAt: new Date() };
          set({ tools: updatedTools });
        }
      },
      deleteTool: async (id) => {
        const { tools } = get();
        set({ tools: tools.filter(t => t.id !== id) });
      },
      assignTool: async (toolId, userId) => {
        const { tools } = get();
        const updatedTools = tools.map(tool => 
          tool.id === toolId 
            ? { ...tool, assignedTo: userId, status: 'in_use' as any, updatedAt: new Date() }
            : tool
        );
        set({ tools: updatedTools });
      },
      returnTool: async (toolId) => {
        const { tools } = get();
        const updatedTools = tools.map(tool => 
          tool.id === toolId 
            ? { ...tool, assignedTo: undefined, status: 'available' as any, updatedAt: new Date() }
            : tool
        );
        set({ tools: updatedTools });
      },
    })
  )
);

// Store для дашборда
export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set, get) => ({
      stats: null,
      loading: false,
      fetchStats: async () => {
        set({ loading: true });
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
          
          set({ stats: mockStats, loading: false });
        } catch (error) {
          set({ loading: false });
        }
      },
    })
  )
);

// Store для уведомлений
export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      fetchNotifications: async () => {
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
        
        set({ 
          notifications: mockNotifications,
          unreadCount: mockNotifications.filter(n => !n.isRead).length
        });
      },
      markAsRead: (id: string) => {
        const { notifications } = get();
        const updatedNotifications = notifications.map(n => 
          n.id === id ? { ...n, isRead: true } : n
        );
        const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
        set({ notifications: updatedNotifications, unreadCount });
      },
      markAllAsRead: () => {
        const { notifications } = get();
        const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
        set({ notifications: updatedNotifications, unreadCount: 0 });
      },
      deleteNotification: (id: string) => {
        const { notifications } = get();
        const updatedNotifications = notifications.filter(n => n.id !== id);
        const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
        set({ notifications: updatedNotifications, unreadCount });
      },
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString(),
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        const { notifications, unreadCount } = get();
        set({ 
          notifications: [newNotification, ...notifications],
          unreadCount: unreadCount + 1
        });
      },
    })
  )
);

// Простые сторы-заглушки для недостающей функциональности
export const useFinanceStore = () => ({
  invoices: [],
  budgets: [],
  contracts: [],
  loading: false,
  fetchInvoices: async () => {},
  fetchBudgets: async () => {},
  fetchContracts: async () => {},
});

export const useReportStore = () => ({
  reports: [],
  templates: [],
  loading: false,
  fetchReports: async () => {},
  fetchTemplates: async () => {},
});

export const useHRStore = () => ({
  employees: [],
  timeEntries: [],
  trainings: [],
  loading: false,
  fetchEmployees: async () => {},
  fetchTimeEntries: async () => {},
  fetchTrainings: async () => {},
});

// Store для общего состояния приложения
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
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
          const { settings } = get();
          set({ settings: { ...settings, ...updates } });
        },
        toggleTheme: () => {
          const { theme, settings } = get();
          const newTheme = theme === 'light' ? 'dark' : 'light';
          set({ 
            theme: newTheme,
            settings: { ...settings, theme: newTheme }
          });
        },
        toggleSidebar: () => {
          const { sidebar } = get();
          set({ sidebar: { ...sidebar, isOpen: !sidebar.isOpen } });
        },
        pinSidebar: (pinned) => {
          const { sidebar } = get();
          set({ sidebar: { ...sidebar, isPinned: pinned } });
        },
      }),
      { name: 'app-store' }
    )
  )
);