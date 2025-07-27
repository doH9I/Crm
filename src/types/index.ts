// Общие типы
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Пользователи и роли
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  FOREMAN = 'foreman', // мастер
  WORKER = 'worker',
  ACCOUNTANT = 'accountant'
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  salary?: number;
  hireDate?: Date;
  department?: string;
  skills?: string[];
  lastLogin?: Date;
}

// Проекты
export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Project extends BaseEntity {
  name: string;
  description?: string;
  client: string;
  clientContact?: string;
  clientPhone?: string;
  address: string;
  status: ProjectStatus;
  startDate: Date;
  endDate?: Date;
  plannedEndDate?: Date;
  budget: number;
  spentAmount: number;
  managerId: string;
  teamMembers: string[]; // user IDs
  progress: number; // 0-100
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

// Виды работ
export enum WorkType {
  FOUNDATION = 'foundation',
  WALLS = 'walls',
  ROOF = 'roof',
  ELECTRICAL = 'electrical',
  PLUMBING = 'plumbing',
  FINISHING = 'finishing',
  LANDSCAPING = 'landscaping',
  OTHER = 'other'
}

export enum TaskStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked'
}

export interface ProjectTask extends BaseEntity {
  projectId: string;
  name: string;
  description?: string;
  workType: WorkType;
  status: TaskStatus;
  assigneeId?: string;
  startDate?: Date;
  endDate?: Date;
  estimatedHours: number;
  actualHours: number;
  materials: MaterialUsage[];
  tools: ToolUsage[];
  cost: number;
  notes?: string;
}

// Сметы
export interface EstimateItem {
  id: string;
  name: string;
  description?: string;
  unit: string; // м², м³, шт, кг и т.д.
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  materialId?: string;
  workType?: WorkType;
}

export interface Estimate extends BaseEntity {
  projectId: string;
  name: string;
  version: number;
  items: EstimateItem[];
  totalMaterials: number;
  totalLabor: number;
  totalCost: number;
  margin: number; // %
  finalCost: number;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
}

// Материалы
export interface Material extends BaseEntity {
  name: string;
  description?: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  supplier?: string;
  supplierContact?: string;
  location?: string; // где хранится
  expiryDate?: Date;
  batchNumber?: string;
  isActive: boolean;
}

export interface MaterialMovement extends BaseEntity {
  materialId: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment';
  quantity: number;
  fromLocation?: string;
  toLocation?: string;
  projectId?: string;
  taskId?: string;
  userId: string;
  reason?: string;
  documentNumber?: string;
}

export interface MaterialUsage {
  materialId: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
}

// Инструменты
export enum ToolCondition {
  NEW = 'new',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  BROKEN = 'broken'
}

export interface Tool extends BaseEntity {
  name: string;
  description?: string;
  category: string;
  serialNumber?: string;
  condition: ToolCondition;
  purchaseDate?: Date;
  purchasePrice?: number;
  currentValue?: number;
  assignedTo?: string; // user ID
  location?: string;
  maintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  isActive: boolean;
  notes?: string;
}

export interface ToolUsage {
  toolId: string;
  assignedTo: string;
  startDate: Date;
  endDate?: Date;
  condition: ToolCondition;
  notes?: string;
}

// Рабочее время
export interface TimeEntry extends BaseEntity {
  userId: string;
  projectId?: string;
  taskId?: string;
  date: Date;
  startTime: Date;
  endTime?: Date;
  totalHours: number;
  breakHours: number;
  overtimeHours: number;
  description?: string;
  isApproved: boolean;
  approvedBy?: string;
}

// Финансы
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer'
}

export interface Transaction extends BaseEntity {
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  projectId?: string;
  userId?: string;
  date: Date;
  paymentMethod?: string;
  documentNumber?: string;
  isRecurring: boolean;
  recurringPeriod?: string;
}

// Клиенты
export interface Client extends BaseEntity {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  companyType: 'individual' | 'company';
  inn?: string;
  kpp?: string;
  notes?: string;
  projects: string[]; // project IDs
}

// Аналитика
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalExpenses: number;
  monthlyExpenses: number;
  profit: number;
  employeeCount: number;
  activeEmployees: number;
  materialCount: number;
  lowStockMaterials: number;
  toolCount: number;
  brokenTools: number;
}

export interface ChartData {
  label: string;
  value: number;
  color?: string;
  date?: Date;
}

// Уведомления
export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success'
}

export interface Notification extends BaseEntity {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
}

// API типы
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Фильтры и сортировка
export interface FilterOptions {
  search?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  assignee?: string;
  project?: string;
  category?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Экспорт
export interface ExportOptions {
  format: 'excel' | 'pdf';
  fileName?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  filters?: FilterOptions;
  columns?: string[];
}

// Настройки приложения
export interface AppSettings {
  companyName: string;
  companyLogo?: string;
  currency: string;
  timezone: string;
  language: string;
  theme: 'light' | 'dark';
  notifications: {
    email: boolean;
    push: boolean;
    lowStock: boolean;
    projectDeadlines: boolean;
    maintenanceReminders: boolean;
  };
}