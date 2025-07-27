import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  AccountBalance as BudgetIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  Warning as WarningIcon,
  Download as ExportIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  Invoice, 
  Budget, 
  Transaction, 
  TransactionType 
} from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`finances-tabpanel-${index}`}
      aria-labelledby={`finances-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Моковые данные
const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    type: 'client',
    clientId: '1',
    projectId: '1',
    issueDate: new Date('2024-01-15'),
    dueDate: new Date('2024-02-15'),
    items: [
      {
        description: 'Фундаментные работы',
        quantity: 1,
        unitPrice: 500000,
        totalPrice: 500000,
        taxRate: 20,
      }
    ],
    subtotal: 500000,
    taxAmount: 100000,
    totalAmount: 600000,
    paidAmount: 300000,
    remainingAmount: 300000,
    status: 'partial',
    currency: 'RUB',
    paymentTerms: '30 дней',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  }
];

const mockBudgets: Budget[] = [
  {
    id: '1',
    projectId: '1',
    name: 'Бюджет проекта "Солнечный"',
    type: 'project',
    period: {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    },
    categories: [
      {
        name: 'Материалы',
        allocatedAmount: 1000000,
        spentAmount: 650000,
        committedAmount: 200000,
        remainingAmount: 150000,
        percentage: 50,
      },
      {
        name: 'Трудозатраты',
        allocatedAmount: 800000,
        spentAmount: 450000,
        committedAmount: 150000,
        remainingAmount: 200000,
        percentage: 40,
      }
    ],
    totalBudget: 2000000,
    totalSpent: 1100000,
    totalCommitted: 350000,
    remainingBudget: 550000,
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-20'),
  }
];

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: TransactionType.EXPENSE,
    amount: 150000,
    description: 'Закупка цемента',
    category: 'Материалы',
    projectId: '1',
    date: new Date('2024-01-18'),
    paymentMethod: 'Банковский перевод',
    status: 'completed',
    isRecurring: false,
    currency: 'RUB',
    tags: ['материалы', 'цемент'],
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
  }
];

const FinancesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  const [openBudgetDialog, setOpenBudgetDialog] = useState(false);
  const [openTransactionDialog, setOpenTransactionDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { control: invoiceControl, handleSubmit: handleInvoiceSubmit, reset: resetInvoice } = useForm<Invoice>();
  const { control: budgetControl, handleSubmit: handleBudgetSubmit, reset: resetBudget } = useForm<Budget>();
  const { control: transactionControl, handleSubmit: handleTransactionSubmit, reset: resetTransaction } = useForm<Transaction>();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCreateInvoice = async (data: Invoice) => {
    try {
      const newInvoice: Invoice = {
        ...data,
        id: Date.now().toString(),
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
        status: 'draft',
        paidAmount: 0,
        remainingAmount: data.totalAmount,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setInvoices(prev => [...prev, newInvoice]);
      setOpenInvoiceDialog(false);
      resetInvoice();
      toast.success('Счет успешно создан');
    } catch (error) {
      toast.error('Ошибка при создании счета');
    }
  };

  const handleCreateBudget = async (data: Budget) => {
    try {
      const newBudget: Budget = {
        ...data,
        id: Date.now().toString(),
        totalSpent: 0,
        totalCommitted: 0,
        remainingBudget: data.totalBudget,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setBudgets(prev => [...prev, newBudget]);
      setOpenBudgetDialog(false);
      resetBudget();
      toast.success('Бюджет успешно создан');
    } catch (error) {
      toast.error('Ошибка при создании бюджета');
    }
  };

  const handleCreateTransaction = async (data: Transaction) => {
    try {
      const newTransaction: Transaction = {
        ...data,
        id: Date.now().toString(),
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setTransactions(prev => [...prev, newTransaction]);
      setOpenTransactionDialog(false);
      resetTransaction();
      toast.success('Транзакция успешно добавлена');
    } catch (error) {
      toast.error('Ошибка при добавлении транзакции');
    }
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'partial':
        return 'warning';
      case 'overdue':
        return 'error';
      case 'sent':
        return 'info';
      default:
        return 'default';
    }
  };

  const getInvoiceStatusText = (status: string) => {
    const statusMap = {
      draft: 'Черновик',
      sent: 'Отправлен',
      viewed: 'Просмотрен',
      partial: 'Частично оплачен',
      paid: 'Оплачен',
      overdue: 'Просрочен',
      cancelled: 'Отменен',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getTransactionTypeColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.INCOME:
        return 'success';
      case TransactionType.EXPENSE:
        return 'error';
      case TransactionType.TRANSFER:
        return 'info';
      default:
        return 'default';
    }
  };

  const getTransactionTypeText = (type: TransactionType) => {
    const typeMap = {
      [TransactionType.INCOME]: 'Доход',
      [TransactionType.EXPENSE]: 'Расход',
      [TransactionType.TRANSFER]: 'Перевод',
      [TransactionType.REFUND]: 'Возврат',
      [TransactionType.PENALTY]: 'Штраф',
      [TransactionType.BONUS]: 'Бонус',
    };
    return typeMap[type] || type;
  };

  const financialStats = {
    totalRevenue: invoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
    totalExpenses: transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0),
    pendingInvoices: invoices.filter(inv => inv.status === 'sent' || inv.status === 'viewed').length,
    overdueInvoices: invoices.filter(inv => inv.status === 'overdue').length,
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Финансы
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={() => toast('Функция экспорта будет добавлена')}
          >
            Экспорт
          </Button>
          <Button
            variant="outlined"
            startIcon={<ViewIcon />}
            onClick={() => toast('Аналитика будет добавлена')}
          >
            Аналитика
          </Button>
        </Box>
      </Box>

      {/* Финансовая статистика */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <IncomeIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {financialStats.totalRevenue.toLocaleString('ru-RU')} ₽
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Общий доход
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ExpenseIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                {financialStats.totalExpenses.toLocaleString('ru-RU')} ₽
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Общие расходы
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PendingIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {financialStats.pendingInvoices}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ожидающие оплаты
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <OverdueIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                {financialStats.overdueInvoices}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Просроченные счета
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {financialStats.overdueInvoices > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          У вас есть {financialStats.overdueInvoices} просроченных счетов, требующих внимания.
        </Alert>
      )}

      {/* Вкладки */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="finance tabs">
            <Tab label="Счета" />
            <Tab label="Бюджеты" />
            <Tab label="Транзакции" />
            <Tab label="Контракты" />
          </Tabs>
        </Box>

        {/* Вкладка "Счета" */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Управление счетами</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedItem(null);
                setOpenInvoiceDialog(true);
              }}
            >
              Создать счет
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Номер счета</TableCell>
                  <TableCell>Клиент</TableCell>
                  <TableCell>Дата выставления</TableCell>
                  <TableCell>Срок оплаты</TableCell>
                  <TableCell>Сумма</TableCell>
                  <TableCell>Оплачено</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {invoice.invoiceNumber}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {invoice.clientId || 'Неизвестен'}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {format(invoice.issueDate, 'dd.MM.yyyy', { locale: ru })}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography 
                        variant="body2"
                        color={new Date(invoice.dueDate) < new Date() ? 'error' : 'inherit'}
                      >
                        {format(invoice.dueDate, 'dd.MM.yyyy', { locale: ru })}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {invoice.totalAmount.toLocaleString('ru-RU')} ₽
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                        {invoice.paidAmount.toLocaleString('ru-RU')} ₽
                      </Typography>
                      {invoice.remainingAmount > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          Остаток: {invoice.remainingAmount.toLocaleString('ru-RU')} ₽
                        </Typography>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Chip 
                        label={getInvoiceStatusText(invoice.status)} 
                        color={getInvoiceStatusColor(invoice.status)}
                        size="small"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <ButtonGroup variant="outlined" size="small">
                        <Tooltip title="Просмотр">
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Отправить">
                          <IconButton size="small">
                            <SendIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Оплата">
                          <IconButton size="small">
                            <PaymentIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Редактировать">
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </ButtonGroup>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {invoices.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <InvoiceIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Нет созданных счетов
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Создайте первый счет для начала работы
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenInvoiceDialog(true)}
              >
                Создать счет
              </Button>
            </Box>
          )}
        </TabPanel>

        {/* Вкладка "Бюджеты" */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Управление бюджетами</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedItem(null);
                setOpenBudgetDialog(true);
              }}
            >
              Создать бюджет
            </Button>
          </Box>

          <Grid container spacing={3}>
            {budgets.map((budget) => (
              <Grid item xs={12} md={6} key={budget.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {budget.name}
                        </Typography>
                        <Chip 
                          label={budget.type === 'project' ? 'Проектный' : 'Общий'} 
                          size="small" 
                          variant="outlined" 
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <IconButton>
                        <EditIcon />
                      </IconButton>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Общий бюджет
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {budget.totalBudget.toLocaleString('ru-RU')} ₽
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Потрачено
                        </Typography>
                        <Typography variant="body1" color="error.main" sx={{ fontWeight: 600 }}>
                          {budget.totalSpent.toLocaleString('ru-RU')} ₽
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Остаток
                        </Typography>
                        <Typography variant="body1" color="success.main" sx={{ fontWeight: 600 }}>
                          {budget.remainingBudget.toLocaleString('ru-RU')} ₽
                        </Typography>
                      </Box>
                    </Box>

                    <LinearProgress 
                      variant="determinate" 
                      value={(budget.totalSpent / budget.totalBudget) * 100}
                      sx={{ mb: 2 }}
                    />

                    <Typography variant="body2" color="text.secondary">
                      Использовано: {Math.round((budget.totalSpent / budget.totalBudget) * 100)}%
                    </Typography>

                    {budget.categories && budget.categories.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Категории:
                        </Typography>
                        {budget.categories.map((category, index) => (
                          <Box key={index} sx={{ mb: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2">
                                {category.name}
                              </Typography>
                              <Typography variant="body2">
                                {category.spentAmount.toLocaleString('ru-RU')} / {category.allocatedAmount.toLocaleString('ru-RU')} ₽
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={(category.spentAmount / category.allocatedAmount) * 100}
                            />
                          </Box>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {budgets.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <BudgetIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Нет созданных бюджетов
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Создайте первый бюджет для контроля расходов
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenBudgetDialog(true)}
              >
                Создать бюджет
              </Button>
            </Box>
          )}
        </TabPanel>

        {/* Вкладка "Транзакции" */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">История транзакций</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedItem(null);
                setOpenTransactionDialog(true);
              }}
            >
              Добавить транзакцию
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Дата</TableCell>
                  <TableCell>Тип</TableCell>
                  <TableCell>Описание</TableCell>
                  <TableCell>Категория</TableCell>
                  <TableCell>Сумма</TableCell>
                  <TableCell>Способ оплаты</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {format(transaction.date, 'dd.MM.yyyy HH:mm', { locale: ru })}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Chip 
                        label={getTransactionTypeText(transaction.type)} 
                        color={getTransactionTypeColor(transaction.type)}
                        size="small"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {transaction.description}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {transaction.category}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          color: transaction.type === TransactionType.INCOME ? 'success.main' : 'error.main'
                        }}
                      >
                        {transaction.type === TransactionType.INCOME ? '+' : '-'}
                        {transaction.amount.toLocaleString('ru-RU')} ₽
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {transaction.paymentMethod || 'Не указан'}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Chip 
                        label={transaction.status === 'completed' ? 'Завершена' : 'В обработке'} 
                        color={transaction.status === 'completed' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <ButtonGroup variant="outlined" size="small">
                        <Tooltip title="Просмотр">
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Редактировать">
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Удалить">
                          <IconButton size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </ButtonGroup>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {transactions.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <MoneyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Нет записей о транзакциях
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Добавьте первую транзакцию для отслеживания финансов
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenTransactionDialog(true)}
              >
                Добавить транзакцию
              </Button>
            </Box>
          )}
        </TabPanel>

        {/* Вкладка "Контракты" */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ContractIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Управление контрактами
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Функция управления контрактами будет добавлена в ближайшее время
            </Typography>
          </Box>
        </TabPanel>
      </Card>

      {/* Диалог создания счета */}
      <Dialog 
        open={openInvoiceDialog} 
        onClose={() => setOpenInvoiceDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleInvoiceSubmit(handleCreateInvoice)}>
          <DialogTitle>
            Создать новый счет
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="clientId"
                  control={invoiceControl}
                  defaultValue=""
                  rules={{ required: 'Выберите клиента' }}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={!!fieldState.error}>
                      <InputLabel>Клиент</InputLabel>
                      <Select {...field} label="Клиент">
                        <MenuItem value="1">ООО "Инвест Строй"</MenuItem>
                        <MenuItem value="2">ПАО "Развитие"</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="projectId"
                  control={invoiceControl}
                  defaultValue=""
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Проект</InputLabel>
                      <Select {...field} label="Проект">
                        <MenuItem value="1">Жилой комплекс "Солнечный"</MenuItem>
                        <MenuItem value="2">Офисный центр "Центральный"</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="issueDate"
                  control={invoiceControl}
                  defaultValue={new Date()}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Дата выставления"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="dueDate"
                  control={invoiceControl}
                  defaultValue={addDays(new Date(), 30)}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Срок оплаты"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="totalAmount"
                  control={invoiceControl}
                  defaultValue={0}
                  rules={{ required: 'Укажите сумму счета', min: { value: 1, message: 'Сумма должна быть больше 0' } }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Общая сумма"
                      type="number"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputProps={{
                        endAdornment: '₽',
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="paymentTerms"
                  control={invoiceControl}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Условия оплаты"
                      placeholder="Например: 30 дней с момента получения счета"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setOpenInvoiceDialog(false)}>
              Отмена
            </Button>
            <Button type="submit" variant="contained">
              Создать счет
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Диалог создания бюджета */}
      <Dialog 
        open={openBudgetDialog} 
        onClose={() => setOpenBudgetDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleBudgetSubmit(handleCreateBudget)}>
          <DialogTitle>
            Создать новый бюджет
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={budgetControl}
                  defaultValue=""
                  rules={{ required: 'Название бюджета обязательно' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Название бюджета"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="type"
                  control={budgetControl}
                  defaultValue="project"
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Тип бюджета</InputLabel>
                      <Select {...field} label="Тип бюджета">
                        <MenuItem value="project">Проектный</MenuItem>
                        <MenuItem value="department">Департамент</MenuItem>
                        <MenuItem value="annual">Годовой</MenuItem>
                        <MenuItem value="monthly">Месячный</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="totalBudget"
                  control={budgetControl}
                  defaultValue={0}
                  rules={{ required: 'Укажите сумму бюджета', min: { value: 1, message: 'Сумма должна быть больше 0' } }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Общая сумма бюджета"
                      type="number"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputProps={{
                        endAdornment: '₽',
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="period.start"
                  control={budgetControl}
                  defaultValue={startOfMonth(new Date())}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Дата начала"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="period.end"
                  control={budgetControl}
                  defaultValue={endOfMonth(new Date())}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Дата окончания"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setOpenBudgetDialog(false)}>
              Отмена
            </Button>
            <Button type="submit" variant="contained">
              Создать бюджет
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Диалог добавления транзакции */}
      <Dialog 
        open={openTransactionDialog} 
        onClose={() => setOpenTransactionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleTransactionSubmit(handleCreateTransaction)}>
          <DialogTitle>
            Добавить транзакцию
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Controller
                  name="type"
                  control={transactionControl}
                  defaultValue={TransactionType.EXPENSE}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Тип транзакции</InputLabel>
                      <Select {...field} label="Тип транзакции">
                        <MenuItem value={TransactionType.INCOME}>Доход</MenuItem>
                        <MenuItem value={TransactionType.EXPENSE}>Расход</MenuItem>
                        <MenuItem value={TransactionType.TRANSFER}>Перевод</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={transactionControl}
                  defaultValue=""
                  rules={{ required: 'Описание обязательно' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Описание"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="amount"
                  control={transactionControl}
                  defaultValue={0}
                  rules={{ required: 'Укажите сумму', min: { value: 1, message: 'Сумма должна быть больше 0' } }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Сумма"
                      type="number"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputProps={{
                        endAdornment: '₽',
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="category"
                  control={transactionControl}
                  defaultValue=""
                  rules={{ required: 'Выберите категорию' }}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={!!fieldState.error}>
                      <InputLabel>Категория</InputLabel>
                      <Select {...field} label="Категория">
                        <MenuItem value="Материалы">Материалы</MenuItem>
                        <MenuItem value="Трудозатраты">Трудозатраты</MenuItem>
                        <MenuItem value="Оборудование">Оборудование</MenuItem>
                        <MenuItem value="Транспорт">Транспорт</MenuItem>
                        <MenuItem value="Прочее">Прочее</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="date"
                  control={transactionControl}
                  defaultValue={new Date()}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Дата транзакции"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="paymentMethod"
                  control={transactionControl}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Способ оплаты"
                      placeholder="Например: Банковский перевод, Наличные"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setOpenTransactionDialog(false)}>
              Отмена
            </Button>
            <Button type="submit" variant="contained">
              Добавить
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default FinancesPage;