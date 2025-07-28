import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

// Простой interface для аутентификации
interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Простой store без immer
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        login: async (email: string, password: string) => {
          // Симуляция логики аутентификации
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Предустановленные пользователи системы
          const users = [
            {
              id: '1',
              email: 'admin@construction-crm.ru',
              password: 'admin123',
              name: 'Главный Администратор',
              role: 'admin',
            },
            {
              id: '2',
              email: 'manager@construction-crm.ru',
              password: 'manager123',
              name: 'Менеджер Проектов',
              role: 'manager',
            },
          ];
          
          const foundUser = users.find(u => u.email === email && u.password === password);
          
          if (foundUser) {
            set({
              user: foundUser,
              isAuthenticated: true,
            });
            return true;
          }
          return false;
        },
        logout: () => {
          set({
            user: null,
            isAuthenticated: false,
          });
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

// Простой interface для проектов
interface ProjectSelectionState {
  selectedProjectId: string | null;
  availableProjects: any[];
  setSelectedProject: (projectId: string | null) => void;
  addAvailableProject: (project: any) => void;
}

export const useProjectSelectionStore = create<ProjectSelectionState>()(
  devtools(
    persist(
      (set, get) => ({
        selectedProjectId: null,
        availableProjects: [
          {
            id: '1',
            name: 'Жилой комплекс "Солнечный"',
            client: 'ООО "Инвест Строй"',
            address: 'г. Москва, ул. Солнечная, 15',
            progress: 50,
            budget: 50000000,
            spentAmount: 25000000,
            status: 'in_progress',
            type: 'residential',
            startDate: new Date('2024-01-15'),
            endDate: new Date('2024-12-15'),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '2',
            name: 'Торговый центр "Метрополис"',
            client: 'АО "Торговые Инвестиции"',
            address: 'г. Москва, ул. Торговая, 42',
            progress: 10,
            budget: 150000000,
            spentAmount: 5000000,
            status: 'planning',
            type: 'commercial',
            startDate: new Date('2024-03-01'),
            endDate: new Date('2025-06-01'),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        setSelectedProject: (projectId: string | null) => {
          set({ selectedProjectId: projectId });
        },
        addAvailableProject: (project: any) => {
          set((state) => ({
            availableProjects: [...state.availableProjects, project]
          }));
        },
      }),
      { 
        name: 'project-selection-store',
      }
    )
  )
);