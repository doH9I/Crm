import { useProjectStore } from '../store';
import { Project, Material, Tool, User, Invoice, Budget, Contract, Client, SafetyIncident, QualityCheck, CalendarEvent, Report, TimeEntry, Training, MaterialOrder, Supplier } from '../types';

export const useProjectFilter = () => {
  const { selectedProject, showAllProjects } = useProjectStore();

  const filterByProject = <T extends { projectId?: string }>(items: T[]): T[] => {
    if (showAllProjects || !selectedProject) {
      return items;
    }
    return items.filter(item => item.projectId === selectedProject.id);
  };

  const filterMaterialsByProject = (materials: Material[]): Material[] => {
    if (showAllProjects || !selectedProject) {
      return materials;
    }
    // Материалы могут быть связаны с проектами через движения
    // Пока возвращаем все материалы, так как связь через projectId не определена в типе Material
    return materials;
  };

  const filterToolsByProject = (tools: Tool[]): Tool[] => {
    if (showAllProjects || !selectedProject) {
      return tools;
    }
    // Инструменты могут быть связаны с проектами через использование
    // Пока возвращаем все инструменты, так как связь через projectId не определена в типе Tool
    return tools;
  };

  const filterEmployeesByProject = (employees: User[]): User[] => {
    if (showAllProjects || !selectedProject) {
      return employees;
    }
    // Сотрудники могут быть связаны с проектами через teamMembers
    return employees.filter(employee => 
      selectedProject.teamMembers.includes(employee.id)
    );
  };

  const filterInvoicesByProject = (invoices: Invoice[]): Invoice[] => {
    return filterByProject(invoices);
  };

  const filterBudgetsByProject = (budgets: Budget[]): Budget[] => {
    return filterByProject(budgets);
  };

  const filterContractsByProject = (contracts: Contract[]): Contract[] => {
    return filterByProject(contracts);
  };

  const filterClientsByProject = (clients: Client[]): Client[] => {
    if (showAllProjects || !selectedProject) {
      return clients;
    }
    // Клиенты связаны с проектами через поле client в Project
    return clients.filter(client => 
      client.projects.includes(selectedProject.id)
    );
  };

  const filterSafetyIncidentsByProject = (incidents: SafetyIncident[]): SafetyIncident[] => {
    return filterByProject(incidents);
  };

  const filterQualityChecksByProject = (checks: QualityCheck[]): QualityCheck[] => {
    return filterByProject(checks);
  };

  const filterCalendarEventsByProject = (events: CalendarEvent[]): CalendarEvent[] => {
    return filterByProject(events);
  };

  const filterReportsByProject = (reports: Report[]): Report[] => {
    if (showAllProjects || !selectedProject) {
      return reports;
    }
    // Отчеты могут быть связаны с проектами через параметры
    return reports;
  };

  const filterTimeEntriesByProject = (entries: TimeEntry[]): TimeEntry[] => {
    return filterByProject(entries);
  };

  const filterTrainingsByProject = (trainings: Training[]): Training[] => {
    if (showAllProjects || !selectedProject) {
      return trainings;
    }
    // Обучения могут быть связаны с проектами через участников
    return trainings;
  };

  const filterMaterialOrdersByProject = (orders: MaterialOrder[]): MaterialOrder[] => {
    return filterByProject(orders);
  };

  const filterSuppliersByProject = (suppliers: Supplier[]): Supplier[] => {
    if (showAllProjects || !selectedProject) {
      return suppliers;
    }
    // Поставщики могут быть связаны с проектами через заказы
    return suppliers;
  };

  return {
    selectedProject,
    showAllProjects,
    filterByProject,
    filterMaterialsByProject,
    filterToolsByProject,
    filterEmployeesByProject,
    filterInvoicesByProject,
    filterBudgetsByProject,
    filterContractsByProject,
    filterClientsByProject,
    filterSafetyIncidentsByProject,
    filterQualityChecksByProject,
    filterCalendarEventsByProject,
    filterReportsByProject,
    filterTimeEntriesByProject,
    filterTrainingsByProject,
    filterMaterialOrdersByProject,
    filterSuppliersByProject,
  };
};