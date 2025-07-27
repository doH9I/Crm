# Руководство разработчика - Construction CRM

## 🚀 Быстрый старт

### Установка зависимостей
```bash
npm install
```

### Запуск в режиме разработки
```bash
npm run dev
```

### Сборка для продакшена
```bash
npm run build
```

### Проверка типов TypeScript
```bash
npm run type-check
```

### Линтинг
```bash
npm run lint
```

## 📁 Архитектура проекта

```
src/
├── components/          # Переиспользуемые компоненты
│   ├── Layout/         # Компоненты макета (Sidebar, Header, etc.)
│   ├── UI/             # Базовые UI компоненты
│   └── Forms/          # Компоненты форм
├── pages/              # Страницы приложения
├── hooks/              # Пользовательские хуки React
├── store/              # Состояние приложения (Zustand)
├── services/           # API сервисы и внешние интеграции
├── types/              # TypeScript типы и интерфейсы
├── utils/              # Утилиты и вспомогательные функции
├── assets/             # Статические ресурсы
└── main.tsx           # Точка входа приложения
```

## 🎨 Дизайн система

### Цветовая палитра
- **Основной**: #1976d2 (синий)
- **Вторичный**: #42a5f5 (светло-синий)
- **Успех**: #10b981 (зеленый)
- **Предупреждение**: #f59e0b (оранжевый)
- **Ошибка**: #ef4444 (красный)
- **Фон**: #f8fafc (светло-серый)

### Компоненты UI
Система использует Material-UI с кастомной темой в бело-синей гамме.

## 🔧 Основные технологии

### Frontend Stack
- **React 18** - Основной фреймворк
- **TypeScript** - Статическая типизация
- **Vite** - Сборщик и dev сервер
- **Material-UI** - UI библиотека
- **Tailwind CSS** - Utility-first CSS

### Состояние и данные
- **Zustand** - Управление состоянием
- **React Query** - Кэширование и синхронизация данных
- **React Hook Form** - Управление формами
- **Zod** - Валидация схем

### Графики и визуализация
- **Recharts** - Основная библиотека графиков
- **Chart.js** - Дополнительные типы графиков

### Утилиты
- **date-fns** - Работа с датами
- **axios** - HTTP клиент
- **react-hot-toast** - Уведомления
- **framer-motion** - Анимации

### Экспорт и документы
- **jsPDF** - Генерация PDF
- **XLSX** - Работа с Excel файлами
- **react-pdf** - Отображение PDF

## 🏗 Разработка новых функций

### Добавление новой страницы

1. Создайте компонент в `src/pages/`
2. Добавьте маршрут в `src/App.tsx`
3. Добавьте пункт меню в `src/components/Layout/Sidebar.tsx`

### Создание нового store

```typescript
// src/store/exampleStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface ExampleState {
  data: any[];
  isLoading: boolean;
  fetchData: () => Promise<void>;
}

export const useExampleStore = create<ExampleState>()(
  devtools(
    immer((set, get) => ({
      data: [],
      isLoading: false,
      
      fetchData: async () => {
        set((state) => {
          state.isLoading = true;
        });
        
        // API вызов
        
        set((state) => {
          state.data = newData;
          state.isLoading = false;
        });
      }
    }))
  )
);
```

### Создание нового типа

```typescript
// src/types/example.ts
export interface Example extends BaseEntity {
  name: string;
  description?: string;
  status: ExampleStatus;
}

export enum ExampleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}
```

## 🎯 Функциональные модули

### 1. Управление проектами
- Создание и редактирование проектов
- Отслеживание прогресса
- Управление задачами
- Контроль бюджета

### 2. Складской учет
- Материалы и их остатки
- Инструменты и их состояние
- Движения по складу
- Уведомления о низких остатках

### 3. Управление персоналом
- Сотрудники и их данные
- Учет рабочего времени
- Расчет заработной платы
- Назначение на проекты

### 4. Финансовый учет
- Доходы и расходы
- Бюджетирование проектов
- Финансовая отчетность
- Прибыль и убытки

### 5. Сметы и калькуляция
- Создание смет
- Калькуляция стоимости
- Версионирование смет
- Утверждение и контроль

### 6. Аналитика и отчеты
- Дашборд с KPI
- Графики и диаграммы
- Экспорт в Excel/PDF
- Настраиваемые отчеты

## 📱 PWA и мобильная адаптация

### PWA настройки
Приложение настроено как Progressive Web App:
- Работает офлайн
- Устанавливается на устройства
- Push уведомления
- Адаптивный дизайн

### Мобильная адаптация
- Responsive дизайн для всех экранов
- Touch-friendly интерфейс
- Оптимизированная навигация
- Быстрая загрузка

## 🔐 Аутентификация и авторизация

### Роли пользователей
- **Admin** - Полный доступ
- **Manager** - Управление проектами
- **Foreman** - Мастер стройки
- **Worker** - Рабочий
- **Accountant** - Бухгалтер

### Демо данные
- Email: `admin@construction-crm.ru`
- Пароль: `admin123`

## 📊 Экспорт данных

### Поддерживаемые форматы
- **Excel (.xlsx)** - Табличные данные
- **PDF** - Отчеты и документы
- **JSON** - Резервное копирование

### Функции экспорта
```typescript
// Экспорт в Excel
import { exportToExcel } from '../utils';

const handleExcelExport = () => {
  exportToExcel(data, 'report.xlsx', 'Отчет');
};

// Экспорт в PDF
import { exportToPDF } from '../utils';

const handlePDFExport = () => {
  exportToPDF(data, 'report.pdf', 'Финансовый отчет');
};
```

## 🚀 Развертывание

### Netlify (рекомендуется)
1. Подключите GitHub репозиторий
2. Netlify автоматически определит настройки
3. Сборка и развертывание произойдут автоматически

### Ручное развертывание
```bash
npm run build
# Загрузите папку dist на хостинг
```

## 🧪 Тестирование

### Добавление тестов
```bash
# Установка тестовых зависимостей
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest jsdom

# Создание тестового файла
# src/components/__tests__/Component.test.tsx
```

## 🔄 CI/CD

### GitHub Actions
Создайте `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Netlify
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run type-check
```

## 📚 Дополнительные ресурсы

### Документация библиотек
- [React](https://react.dev/)
- [Material-UI](https://mui.com/)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Query](https://tanstack.com/query/)
- [Recharts](https://recharts.org/)

### Полезные инструменты
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Material-UI Theme Creator](https://mui.com/customization/theming/)
- [React DevTools](https://react.dev/learn/react-developer-tools)

## 🤝 Вклад в проект

### Стандарты кода
- Используйте TypeScript для всех новых файлов
- Следуйте ESLint правилам
- Добавляйте комментарии для сложной логики
- Создавайте переиспользуемые компоненты

### Commit сообщения
```
feat: добавлена страница управления материалами
fix: исправлена ошибка в расчете сметы
docs: обновлена документация API
style: улучшен дизайн карточек проектов
```

### Pull Request процесс
1. Создайте feature ветку
2. Внесите изменения
3. Добавьте тесты (если применимо)
4. Создайте Pull Request
5. Дождитесь ревью

## 🐛 Отладка

### Полезные инструменты
- React DevTools - инспекция компонентов
- Redux DevTools - состояние Zustand
- Network Tab - API запросы
- Console - логи и ошибки

### Частые проблемы
- **Ошибки TypeScript**: Проверьте типы
- **Проблемы с роутингом**: Убедитесь в правильных путях
- **Состояние не обновляется**: Проверьте immer и мутации

## 📧 Поддержка

Для вопросов и предложений создавайте Issues в GitHub репозитории или обращайтесь к команде разработки.