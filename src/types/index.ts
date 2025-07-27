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
  ACCOUNTANT = 'accountant',
  ARCHITECT = 'architect',
  ENGINEER = 'engineer',
  SAFETY_OFFICER = 'safety_officer', // инженер по ТБ
  QUALITY_CONTROLLER = 'quality_controller',
  PROCUREMENT_MANAGER = 'procurement_manager',
  LOGISTICS_COORDINATOR = 'logistics_coordinator'
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
  emergencyContact?: string;
  emergencyPhone?: string;
  address?: string;
  passport?: string;
  inn?: string;
  bankAccount?: string;
  certifications?: Certification[];
  performanceRating?: number; // 1-5
  birthDate?: Date;
  position?: string;
  contractType?: 'permanent' | 'temporary' | 'contractor';
  workSchedule?: WorkSchedule;
  permissions?: Permission[];
}

// Сертификации и квалификации
export interface Certification extends BaseEntity {
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  certificateNumber: string;
  isValid: boolean;
  documentUrl?: string;
}

// График работы
export interface WorkSchedule {
  type: 'standard' | 'shift' | 'flexible';
  hoursPerWeek: number;
  workDays: number[]; // 1-7 (понедельник-воскресенье)
  startTime: string;
  endTime: string;
  lunchBreakDuration: number; // в минутах
}

// Разрешения
export interface Permission {
  module: string;
  actions: string[]; // ['read', 'write', 'delete', 'approve']
}

// Проекты (расширенные)
export enum ProjectStatus {
  PLANNING = 'planning',
  TENDER = 'tender', // тендер
  APPROVED = 'approved', // утвержден
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  QUALITY_CHECK = 'quality_check',
  CLIENT_REVIEW = 'client_review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  WARRANTY = 'warranty' // гарантийный период
}

export enum ProjectType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  INDUSTRIAL = 'industrial',
  INFRASTRUCTURE = 'infrastructure',
  RENOVATION = 'renovation',
  DEMOLITION = 'demolition'
}

export interface Project extends BaseEntity {
  name: string;
  description?: string;
  client: string;
  clientContact?: string;
  clientPhone?: string;
  clientEmail?: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  status: ProjectStatus;
  type: ProjectType;
  startDate: Date;
  endDate?: Date;
  plannedEndDate?: Date;
  budget: number;
  spentAmount: number;
  approvedBudget?: number;
  contingencyFund: number; // резервный фонд
  managerId: string;
  architectId?: string;
  engineerId?: string;
  teamMembers: string[];
  progress: number; // 0-100
  priority: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
  riskLevel: 'low' | 'medium' | 'high';
  permits?: Permit[];
  contracts?: Contract[];
  phases?: ProjectPhase[];
  qualityChecks?: QualityCheck[];
  documents?: Document[];
  weatherSensitive: boolean;
  safetyRequirements?: string[];
}

// Разрешения и лицензии
export interface Permit extends BaseEntity {
  name: string;
  type: 'building' | 'environmental' | 'safety' | 'other';
  issuer: string;
  issueDate: Date;
  expiryDate: Date;
  permitNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  documentUrl?: string;
  cost: number;
}

// Контракты
export interface Contract extends BaseEntity {
  contractNumber: string;
  clientId: string;
  projectId?: string;
  type: 'main' | 'subcontract' | 'supply' | 'service';
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  paymentTerms: string;
  status: 'draft' | 'signed' | 'active' | 'completed' | 'terminated';
  documentUrl?: string;
  milestones?: Milestone[];
}

// Этапы проекта
export interface ProjectPhase extends BaseEntity {
  projectId: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  spentAmount: number;
  progress: number;
  status: TaskStatus;
  dependencies: string[]; // IDs других этапов
  tasks: ProjectTask[];
}

// Вехи проекта
export interface Milestone extends BaseEntity {
  name: string;
  description?: string;
  dueDate: Date;
  isCompleted: boolean;
  completedDate?: Date;
  paymentAmount?: number;
  isPaid: boolean;
}

// Виды работ (расширенные)
export enum WorkType {
  FOUNDATION = 'foundation',
  WALLS = 'walls',
  ROOF = 'roof',
  ELECTRICAL = 'electrical',
  PLUMBING = 'plumbing',
  HVAC = 'hvac', // отопление, вентиляция, кондиционирование
  FINISHING = 'finishing',
  FLOORING = 'flooring',
  PAINTING = 'painting',
  LANDSCAPING = 'landscaping',
  INSULATION = 'insulation',
  WATERPROOFING = 'waterproofing',
  DEMOLITION = 'demolition',
  EXCAVATION = 'excavation',
  CONCRETE = 'concrete',
  STEEL_WORK = 'steel_work',
  MASONRY = 'masonry',
  WINDOWS_DOORS = 'windows_doors',
  SECURITY_SYSTEMS = 'security_systems',
  CLEANING = 'cleaning',
  INSPECTION = 'inspection',
  OTHER = 'other'
}

export enum TaskStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  WAITING_MATERIALS = 'waiting_materials',
  WAITING_APPROVAL = 'waiting_approval',
  QUALITY_CHECK = 'quality_check',
  REWORK_REQUIRED = 'rework_required',
  COMPLETED = 'completed',
  BLOCKED = 'blocked'
}

export interface ProjectTask extends BaseEntity {
  projectId: string;
  phaseId?: string;
  name: string;
  description?: string;
  workType: WorkType;
  status: TaskStatus;
  assigneeId?: string;
  supervisorId?: string;
  startDate?: Date;
  endDate?: Date;
  estimatedHours: number;
  actualHours: number;
  materials: MaterialUsage[];
  tools: ToolUsage[];
  cost: number;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  dependencies: string[]; // IDs других задач
  qualityStandard?: string;
  safetyRequirements?: string[];
  weatherDependent: boolean;
  location?: string; // конкретное место на объекте
  photos?: TaskPhoto[];
  issues?: TaskIssue[];
}

// Фотографии задач
export interface TaskPhoto extends BaseEntity {
  taskId: string;
  url: string;
  description?: string;
  takenBy: string;
  takenAt: Date;
  type: 'before' | 'progress' | 'after' | 'issue';
}

// Проблемы по задачам
export interface TaskIssue extends BaseEntity {
  taskId: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportedBy: string;
  reportedAt: Date;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  resolvedAt?: Date;
  resolution?: string;
}

// Сметы (расширенные)
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
  supplier?: string;
  leadTime: number; // время поставки в днях
  category: 'material' | 'labor' | 'equipment' | 'subcontract' | 'other';
}

export interface Estimate extends BaseEntity {
  projectId: string;
  name: string;
  version: number;
  items: EstimateItem[];
  totalMaterials: number;
  totalLabor: number;
  totalEquipment: number;
  totalSubcontracts: number;
  totalOther: number;
  subtotal: number;
  taxes: number;
  margin: number; // %
  finalCost: number;
  validUntil?: Date;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
  currency: string;
  exchangeRate?: number;
  riskMargin: number; // дополнительная маржа на риски
}

// Материалы (расширенные)
export interface Material extends BaseEntity {
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  sku: string; // артикул
  barcode?: string;
  unit: string;
  currentStock: number;
  reservedStock: number; // зарезервировано под проекты
  availableStock: number; // доступно к использованию
  minStock: number;
  maxStock: number;
  reorderPoint: number; // точка перезаказа
  unitPrice: number;
  avgPrice: number; // средняя цена
  lastPurchasePrice: number;
  supplier?: string;
  alternativeSuppliers?: string[];
  supplierContact?: string;
  location?: string; // где хранится
  zone?: string; // зона склада
  shelf?: string; // полка
  expiryDate?: Date;
  batchNumber?: string;
  lotNumber?: string;
  manufacturerDate?: Date;
  manufacturer?: string;
  specifications?: MaterialSpecification[];
  isActive: boolean;
  isHazardous: boolean;
  storageConditions?: string;
  qualityCertificate?: string;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  photo?: string;
  qrCode?: string;
}

// Спецификации материалов
export interface MaterialSpecification {
  name: string;
  value: string;
  unit?: string;
}

// Движение материалов (расширенное)
export interface MaterialMovement extends BaseEntity {
  materialId: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment' | 'return' | 'waste';
  quantity: number;
  fromLocation?: string;
  toLocation?: string;
  fromZone?: string;
  toZone?: string;
  projectId?: string;
  taskId?: string;
  userId: string;
  reason?: string;
  documentNumber?: string;
  supplierId?: string;
  unitPrice?: number;
  totalCost?: number;
  qualityCheck?: boolean;
  qualityNotes?: string;
  expiryDate?: Date;
  batchNumber?: string;
}

export interface MaterialUsage {
  materialId: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  wastePercentage: number; // процент потерь
  actualUsed?: number; // фактически использовано
}

// Поставщики
export interface Supplier extends BaseEntity {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  inn?: string;
  kpp?: string;
  paymentTerms: string;
  deliveryTerms: string;
  rating: number; // 1-5
  isActive: boolean;
  categories: string[]; // категории поставляемых материалов
  priceList?: SupplierPriceItem[];
  contracts?: Contract[];
  reviews?: SupplierReview[];
}

export interface SupplierPriceItem {
  materialId: string;
  price: number;
  minQuantity: number;
  leadTime: number; // время поставки в днях
  validFrom: Date;
  validTo?: Date;
}

export interface SupplierReview extends BaseEntity {
  supplierId: string;
  reviewedBy: string;
  rating: number;
  qualityRating: number;
  deliveryRating: number;
  priceRating: number;
  serviceRating: number;
  comment?: string;
  orderId?: string;
}

// Заказы материалов
export interface MaterialOrder extends BaseEntity {
  orderNumber: string;
  supplierId: string;
  projectId?: string;
  items: MaterialOrderItem[];
  totalAmount: number;
  status: 'draft' | 'sent' | 'confirmed' | 'partially_delivered' | 'delivered' | 'cancelled';
  orderDate: Date;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  notes?: string;
  urgentOrder: boolean;
  deliveryAddress: string;
  createdBy: string;
  approvedBy?: string;
}

export interface MaterialOrderItem {
  materialId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  deliveredQuantity?: number;
  notes?: string;
}

// Инструменты (расширенные)
export enum ToolCondition {
  NEW = 'new',
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  BROKEN = 'broken',
  MAINTENANCE = 'maintenance' // на обслуживании
}

export enum ToolStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  MAINTENANCE = 'maintenance',
  REPAIR = 'repair',
  RETIRED = 'retired',
  LOST = 'lost',
  STOLEN = 'stolen'
}

export interface Tool extends BaseEntity {
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  inventoryNumber: string;
  condition: ToolCondition;
  status: ToolStatus;
  purchaseDate?: Date;
  purchasePrice?: number;
  currentValue?: number;
  depreciationRate?: number; // норма амортизации в год
  assignedTo?: string; // user ID
  location?: string;
  zone?: string;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  maintenanceInterval: number; // в днях
  usageHours: number; // общее время использования
  fuelType?: string; // для техники
  engineHours?: number; // моточасы
  licensePlate?: string; // номерной знак для транспорта
  insuranceExpiry?: Date;
  warrantyExpiry?: Date;
  manualUrl?: string;
  photo?: string;
  qrCode?: string;
  isActive: boolean;
  notes?: string;
  specifications?: ToolSpecification[];
  maintenanceHistory?: MaintenanceRecord[];
}

export interface ToolSpecification {
  name: string;
  value: string;
  unit?: string;
}

export interface MaintenanceRecord extends BaseEntity {
  toolId: string;
  type: 'routine' | 'repair' | 'calibration' | 'inspection';
  performedBy: string;
  date: Date;
  description: string;
  cost: number;
  partsReplaced?: string[];
  nextMaintenanceDate?: Date;
  notes?: string;
  photos?: string[];
}

export interface ToolUsage {
  toolId: string;
  assignedTo: string;
  startDate: Date;
  endDate?: Date;
  condition: ToolCondition;
  usageHours?: number;
  location?: string;
  purpose?: string; // для чего использовался
  notes?: string;
}

// Рабочее время (расширенное)
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
  location?: string;
  workType?: WorkType;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  photos?: string[]; // фото рабочего процесса
  gpsLocation?: { lat: number; lng: number };
  weather?: WeatherData;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  condition: string; // sunny, cloudy, rainy, snowy
}

// Отпуска и больничные
export interface TimeOff extends BaseEntity {
  userId: string;
  type: 'vacation' | 'sick_leave' | 'personal' | 'maternity' | 'unpaid';
  startDate: Date;
  endDate: Date;
  days: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  rejectionReason?: string;
  documentUrl?: string;
}

// Финансы (расширенные)
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
  REFUND = 'refund',
  PENALTY = 'penalty',
  BONUS = 'bonus'
}

export interface Transaction extends BaseEntity {
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  subcategory?: string;
  projectId?: string;
  contractId?: string;
  supplierId?: string;
  userId?: string;
  date: Date;
  dueDate?: Date;
  paymentMethod?: string;
  documentNumber?: string;
  invoiceNumber?: string;
  isRecurring: boolean;
  recurringPeriod?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  bankAccount?: string;
  currency: string;
  exchangeRate?: number;
  tags?: string[];
  attachments?: string[];
}

// Бюджеты
export interface Budget extends BaseEntity {
  projectId?: string;
  name: string;
  type: 'project' | 'department' | 'annual' | 'monthly';
  period: { start: Date; end: Date };
  categories: BudgetCategory[];
  totalBudget: number;
  totalSpent: number;
  totalCommitted: number; // зарезервировано
  remainingBudget: number;
  status: 'draft' | 'approved' | 'active' | 'completed' | 'exceeded';
  approvedBy?: string;
}

export interface BudgetCategory {
  name: string;
  allocatedAmount: number;
  spentAmount: number;
  committedAmount: number;
  remainingAmount: number;
  percentage: number; // от общего бюджета
}

// Счета и инвойсы
export interface Invoice extends BaseEntity {
  invoiceNumber: string;
  type: 'client' | 'supplier' | 'subcontractor';
  clientId?: string;
  supplierId?: string;
  projectId?: string;
  contractId?: string;
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  currency: string;
  paymentTerms: string;
  notes?: string;
  documentUrl?: string;
  payments?: Payment[];
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
  materialId?: string;
  taskId?: string;
}

export interface Payment extends BaseEntity {
  invoiceId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  reference?: string;
  notes?: string;
}

// Клиенты (расширенные)
export interface Client extends BaseEntity {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  billingAddress?: string;
  companyType: 'individual' | 'company' | 'government' | 'ngo';
  inn?: string;
  kpp?: string;
  ogrn?: string;
  bankDetails?: BankDetails;
  paymentTerms?: string;
  creditLimit?: number;
  rating: number; // 1-5
  source: 'website' | 'referral' | 'advertising' | 'cold_call' | 'exhibition' | 'other';
  tags?: string[];
  notes?: string;
  projects: string[]; // project IDs
  contracts?: string[]; // contract IDs
  isActive: boolean;
  preferredContactMethod: 'email' | 'phone' | 'sms' | 'messenger';
  communicationHistory?: CommunicationRecord[];
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  bic?: string;
  correspondent?: string;
}

export interface CommunicationRecord extends BaseEntity {
  clientId: string;
  type: 'call' | 'email' | 'meeting' | 'sms' | 'note';
  direction: 'incoming' | 'outgoing';
  subject?: string;
  content: string;
  date: Date;
  userId: string;
  followUpDate?: Date;
  status: 'pending' | 'completed' | 'cancelled';
}

// Качество
export interface QualityCheck extends BaseEntity {
  projectId: string;
  taskId?: string;
  inspectorId: string;
  type: 'materials' | 'workmanship' | 'safety' | 'environmental' | 'final';
  date: Date;
  checklist: QualityCheckItem[];
  overallStatus: 'passed' | 'failed' | 'conditional';
  score: number; // 0-100
  notes?: string;
  photos?: string[];
  correctionRequired: boolean;
  correctionDeadline?: Date;
  reinspectionDate?: Date;
  certificate?: string;
}

export interface QualityCheckItem {
  criterion: string;
  requirement: string;
  status: 'passed' | 'failed' | 'n/a';
  notes?: string;
  photo?: string;
}

// Безопасность
export interface SafetyIncident extends BaseEntity {
  projectId: string;
  reportedBy: string;
  date: Date;
  location: string;
  type: 'injury' | 'near_miss' | 'property_damage' | 'environmental' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  peopleInvolved: string[];
  injuries?: InjuryDetails[];
  immediateAction: string;
  rootCause?: string;
  preventiveMeasures?: string;
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  investigator?: string;
  photos?: string[];
  documents?: string[];
}

export interface InjuryDetails {
  personId: string;
  injuryType: string;
  bodyPart: string;
  severity: 'minor' | 'major' | 'critical';
  medicalAttention: boolean;
  hospitalName?: string;
  returnToWorkDate?: Date;
}

// Аналитика (расширенная)
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalExpenses: number;
  monthlyExpenses: number;
  profit: number;
  profitMargin: number;
  employeeCount: number;
  activeEmployees: number;
  materialCount: number;
  lowStockMaterials: number;
  toolCount: number;
  brokenTools: number;
  toolsInMaintenance: number;
  pendingInvoices: number;
  overdueInvoices: number;
  cashFlow: number;
  projectsOnSchedule: number;
  projectsDelayed: number;
  averageProjectDuration: number;
  clientSatisfactionScore: number;
  safetyIncidentsThisMonth: number;
  qualityScore: number;
  utilizationRate: number; // загрузка сотрудников
}

export interface ChartData {
  label: string;
  value: number;
  color?: string;
  date?: Date;
  category?: string;
  percentage?: number;
}

// Документы
export interface Document extends BaseEntity {
  name: string;
  type: 'contract' | 'permit' | 'certificate' | 'drawing' | 'photo' | 'report' | 'invoice' | 'other';
  category?: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  projectId?: string;
  taskId?: string;
  clientId?: string;
  supplierId?: string;
  uploadedBy: string;
  version: number;
  isLatest: boolean;
  tags?: string[];
  expiryDate?: Date;
  accessLevel: 'public' | 'internal' | 'confidential' | 'restricted';
  checksum?: string;
}

// Календарные события
export interface CalendarEvent extends BaseEntity {
  title: string;
  description?: string;
  type: 'task' | 'meeting' | 'deadline' | 'delivery' | 'inspection' | 'holiday' | 'training';
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  location?: string;
  participants?: string[];
  projectId?: string;
  taskId?: string;
  isRecurring: boolean;
  recurrenceRule?: string;
  reminders?: EventReminder[];
  status: 'tentative' | 'confirmed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  color?: string;
}

export interface EventReminder {
  type: 'email' | 'sms' | 'push';
  minutesBefore: number;
}

// Уведомления (расширенные)
export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
  URGENT = 'urgent'
}

export interface Notification extends BaseEntity {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  category: 'project' | 'inventory' | 'finance' | 'safety' | 'quality' | 'system' | 'hr';
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  priority: 'low' | 'medium' | 'high';
  expiresAt?: Date;
  data?: Record<string, any>; // дополнительные данные
}

// Интеграции
export interface Integration extends BaseEntity {
  name: string;
  type: '1c' | 'bank' | 'email' | 'sms' | 'weather' | 'maps' | 'accounting' | 'other';
  status: 'active' | 'inactive' | 'error';
  config: Record<string, any>;
  lastSync?: Date;
  errorMessage?: string;
  syncFrequency: number; // в минутах
}

// Отчеты
export interface Report extends BaseEntity {
  name: string;
  type: 'financial' | 'project' | 'hr' | 'inventory' | 'quality' | 'safety' | 'custom';
  description?: string;
  parameters: ReportParameter[];
  schedule?: ReportSchedule;
  recipients?: string[];
  format: 'pdf' | 'excel' | 'json' | 'csv';
  isActive: boolean;
  lastGenerated?: Date;
  createdBy: string;
}

export interface ReportParameter {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'select';
  value?: any;
  options?: string[];
  required: boolean;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  timezone: string;
}

// API типы
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
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
  tags?: string[];
  priority?: string;
  location?: string;
  department?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Экспорт
export interface ExportOptions {
  format: 'excel' | 'pdf' | 'csv' | 'json';
  fileName?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  filters?: FilterOptions;
  columns?: string[];
  template?: string;
  includeCharts?: boolean;
  includeImages?: boolean;
}

// Настройки приложения (расширенные)
export interface AppSettings {
  companyName: string;
  companyLogo?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWebsite?: string;
  inn?: string;
  kpp?: string;
  currency: string;
  timezone: string;
  language: string;
  dateFormat: string;
  theme: 'light' | 'dark' | 'auto';
  workingHours: {
    start: string;
    end: string;
    lunchStart: string;
    lunchEnd: string;
  };
  workingDays: number[]; // 1-7
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    lowStock: boolean;
    projectDeadlines: boolean;
    maintenanceReminders: boolean;
    safetyAlerts: boolean;
    qualityIssues: boolean;
    budgetOverruns: boolean;
    overdueInvoices: boolean;
  };
  security: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    sessionTimeout: number; // в минутах
    twoFactorEnabled: boolean;
    ipWhitelist?: string[];
  };
  integrations: {
    maps: boolean;
    weather: boolean;
    accounting: boolean;
    banking: boolean;
    email: boolean;
    sms: boolean;
  };
  backups: {
    autoBackup: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    retention: number; // количество копий для хранения
    cloudStorage?: string;
  };
}

// Резервные копии
export interface Backup extends BaseEntity {
  name: string;
  type: 'manual' | 'automatic';
  size: number;
  status: 'creating' | 'completed' | 'failed';
  fileUrl?: string;
  checksum?: string;
  createdBy?: string;
  expiresAt?: Date;
}

// Аудит и логи
export interface AuditLog extends BaseEntity {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  result: 'success' | 'failure';
  errorMessage?: string;
}

// Шаблоны
export interface Template extends BaseEntity {
  name: string;
  type: 'project' | 'task' | 'estimate' | 'contract' | 'report' | 'email';
  category?: string;
  description?: string;
  content: Record<string, any>;
  isDefault: boolean;
  isActive: boolean;
  createdBy: string;
  usageCount: number;
}

// Комментарии
export interface Comment extends BaseEntity {
  entityType: string; // project, task, etc.
  entityId: string;
  userId: string;
  content: string;
  isInternal: boolean; // внутренний комментарий или для клиента
  attachments?: string[];
  mentions?: string[]; // упомянутые пользователи
  parentId?: string; // для ответов на комментарии
}

// Теги
export interface Tag extends BaseEntity {
  name: string;
  color: string;
  description?: string;
  category?: string;
  usageCount: number;
}

// Избранное
export interface Favorite extends BaseEntity {
  userId: string;
  entityType: string;
  entityId: string;
  name?: string; // пользовательское название
  notes?: string;
}

// Быстрые ссылки
export interface QuickLink extends BaseEntity {
  userId: string;
  name: string;
  url: string;
  icon?: string;
  color?: string;
  order: number;
}

// Виджеты дашборда
export interface DashboardWidget extends BaseEntity {
  userId: string;
  type: 'chart' | 'table' | 'metric' | 'calendar' | 'todo' | 'weather' | 'news';
  title: string;
  config: Record<string, any>;
  position: { x: number; y: number; width: number; height: number };
  isVisible: boolean;
  refreshInterval?: number; // в секундах
}

// Чек-листы
export interface Checklist extends BaseEntity {
  name: string;
  description?: string;
  type: 'safety' | 'quality' | 'maintenance' | 'delivery' | 'inspection' | 'other';
  items: ChecklistItem[];
  projectId?: string;
  taskId?: string;
  isTemplate: boolean;
  createdBy: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: Date;
  notes?: string;
  isRequired: boolean;
  order: number;
}

// Прогноз погоды
export interface WeatherForecast extends BaseEntity {
  location: string;
  date: Date;
  temperature: { min: number; max: number };
  humidity: number;
  windSpeed: number;
  precipitation: number;
  condition: string;
  visibility: number;
  uvIndex: number;
  workRecommendation: 'ideal' | 'good' | 'limited' | 'not_recommended';
}

// Субподрядчики
export interface Subcontractor extends BaseEntity {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  specializations: WorkType[];
  rating: number;
  isActive: boolean;
  certifications: string[];
  insurance: {
    provider: string;
    policyNumber: string;
    expiryDate: Date;
    coverage: number;
  };
  performance: {
    projectsCompleted: number;
    averageRating: number;
    onTimeDelivery: number; // процент
    qualityScore: number;
  };
  contracts: string[];
  documents: string[];
}

// Оборудование и техника
export interface Equipment extends BaseEntity {
  name: string;
  type: 'vehicle' | 'machinery' | 'generator' | 'crane' | 'excavator' | 'truck' | 'other';
  brand: string;
  model: string;
  year: number;
  serialNumber: string;
  licensePlate?: string;
  status: ToolStatus;
  location: string;
  operatorId?: string;
  fuelLevel?: number;
  mileage?: number;
  engineHours?: number;
  lastService: Date;
  nextService: Date;
  insurance: {
    provider: string;
    policyNumber: string;
    expiryDate: Date;
  };
  documents: string[];
  maintenanceLog: MaintenanceRecord[];
}

// GPS трекинг
export interface GPSLocation extends BaseEntity {
  deviceId: string;
  equipmentId?: string;
  userId?: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  timestamp: Date;
}

// Обучение и сертификация
export interface Training extends BaseEntity {
  name: string;
  type: 'safety' | 'technical' | 'compliance' | 'software' | 'soft_skills';
  description: string;
  duration: number; // в часах
  instructor?: string;
  location?: string;
  isOnline: boolean;
  maxParticipants?: number;
  startDate: Date;
  endDate: Date;
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled';
  materials?: string[];
  participants: TrainingParticipant[];
  cost: number;
  isRequired: boolean;
  certificate: boolean;
}

export interface TrainingParticipant {
  userId: string;
  status: 'enrolled' | 'completed' | 'failed' | 'no_show';
  score?: number;
  certificateUrl?: string;
  completedAt?: Date;
  notes?: string;
}

// Инвентаризация
export interface Inventory extends BaseEntity {
  name: string;
  description?: string;
  location: string;
  plannedDate: Date;
  actualDate?: Date;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  conductedBy: string[];
  items: InventoryItem[];
  discrepancies: InventoryDiscrepancy[];
  notes?: string;
}

export interface InventoryItem {
  itemId: string;
  itemType: 'material' | 'tool' | 'equipment';
  expectedQuantity: number;
  actualQuantity?: number;
  condition?: string;
  location?: string;
  notes?: string;
  isVerified: boolean;
}

export interface InventoryDiscrepancy {
  itemId: string;
  itemType: 'material' | 'tool' | 'equipment';
  discrepancyType: 'missing' | 'surplus' | 'damaged' | 'misplaced';
  expectedQuantity: number;
  actualQuantity: number;
  explanation?: string;
  actionTaken?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
}