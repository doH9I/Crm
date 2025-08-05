# Construction CRM - Система управления строительной организацией

[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR_BADGE_ID/deploy-status)](https://app.netlify.com/sites/YOUR_SITE_NAME/deploys)

Полнофункциональная система управления строительной организацией с современным веб-интерфейсом, построенная на чистом JavaScript (ES6+) без фреймворков.

## 🚀 Демо

**Live Demo:** [https://your-site-name.netlify.app](https://your-site-name.netlify.app)

## ✨ Основные возможности

### 📊 **Модули системы:**
- **📈 Аналитический дашборд** - KPI метрики, интерактивные графики Chart.js
- **👥 Управление клиентами** - база клиентов (физ./юр. лица, ИП)
- **🏗 Управление подрядчиками** - поставщики, специализации, рейтинги
- **👨‍💼 Управление персоналом** - сотрудники, табель учета времени
- **📦 Складской учет** - товары, остатки, движения, категории
- **📋 Управление проектами** - статусы, бюджеты, прогресс
- **💰 Составление смет по ГОСТ** - автоматические расчеты, шаблоны
- **💼 Коммерческие предложения** - визуальный редактор, шаблоны
- **🔗 Интеграция с каталогами** - ЛеруаМерлен, Петрович
- **📄 Экспорт/Импорт данных** - Excel, CSV, PDF, JSON
- **🧪 Система тестирования** - автоматические тесты, отладка

### 🎨 **Дизайн и UX:**
- Material Design с современными градиентами
- Полная адаптивность (мобильные, планшеты, десктоп)
- Темная и светлая темы
- Анимации и интерактивные элементы
- Font Awesome иконки

### 🔧 **Технологии:**
- **Frontend:** HTML5, CSS3, JavaScript ES6+
- **Графики:** Chart.js
- **Иконки:** Font Awesome
- **Шрифты:** Google Fonts (Inter)
- **Архитектура:** Модульная структура, SPA роутинг

## 🏗 Архитектура проекта

```
public/
├── css/                    # Стили
│   ├── styles.css         # Основные стили
│   ├── dashboard.css      # Стили дашборда
│   ├── modules.css        # Стили модулей
│   └── responsive.css     # Адаптивность
├── js/                    # JavaScript модули
│   ├── app.js            # Основное приложение
│   ├── auth.js           # Авторизация
│   ├── dashboard.js      # Дашборд с аналитикой
│   ├── estimates.js      # Модуль смет
│   ├── warehouse.js      # Складской учет
│   ├── offers.js         # Коммерческие предложения
│   ├── export-import.js  # Экспорт/импорт
│   ├── catalog-integration.js # Интеграция каталогов
│   ├── system-testing.js # Тестирование
│   └── utils.js          # Утилиты
├── database/             # SQL схема базы данных
│   └── schema.sql        # Структура таблиц
├── index.html           # Главная страница
├── _redirects          # Netlify redirects для SPA
└── favicon.ico         # Иконка сайта
```

## 🚀 Быстрый старт

### Локальная разработка

1. **Клонируйте репозиторий:**
```bash
git clone https://github.com/your-username/construction-crm.git
cd construction-crm
```

2. **Запустите локальный сервер:**
```bash
# Используйте любой статический сервер
npx serve public
# или
python -m http.server 8000 --directory public
# или
php -S localhost:8000 -t public
```

3. **Откройте в браузере:**
```
http://localhost:8000
```

### Демо вход в систему
- **Email:** admin@company.ru
- **Пароль:** admin123

## 🌐 Развертывание на Netlify

### Автоматическое развертывание

1. **Подключите GitHub репозиторий к Netlify:**
   - Войдите в [Netlify](https://netlify.com)
   - Нажмите "New site from Git"
   - Выберите GitHub и ваш репозиторий
   - Настройки сборки:
     - **Build command:** `echo 'No build needed'`
     - **Publish directory:** `public`
   - Нажмите "Deploy site"

2. **Настройка домена (опционально):**
   - В настройках сайта → Domain management
   - Добавьте кастомный домен

### Ручное развертывание

1. **Загрузите папку `public` в Netlify:**
   - Перетащите папку `public` на [netlify.com/drop](https://netlify.com/drop)
   - Или используйте Netlify CLI:

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=public
```

## 🔧 Конфигурация

### Файлы конфигурации:
- `netlify.toml` - настройки Netlify
- `public/_redirects` - правила редиректов для SPA
- `public/js/config.js` - конфигурация приложения (создается автоматически)

### Переменные окружения:
Создайте в Netlify следующие переменные:
- `API_URL` - URL API сервера (если используется)
- `ENVIRONMENT` - production/development

## 📱 Поддерживаемые браузеры

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🧪 Тестирование

Встроенная система тестирования доступна в интерфейсе:
- Откройте модуль "Тестирование и отладка"
- Запустите автоматические тесты
- Просмотрите отчет о производительности

### Категории тестов:
- **Функциональные** - авторизация, навигация, загрузка модулей
- **Интеграционные** - API, загрузка данных, файлы
- **UI** - адаптивность, модальные окна, валидация
- **Производительность** - время загрузки, память, рендеринг

## 📊 Мониторинг

### Netlify Analytics
В панели Netlify доступна аналитика:
- Трафик и посещаемость
- Производительность сайта
- Ошибки и статус деплоя

### Производительность
- Lighthouse Score: 90+
- First Contentful Paint: <2s
- Largest Contentful Paint: <3s
- Cumulative Layout Shift: <0.1

## 🔒 Безопасность

### Реализованные меры:
- CSP (Content Security Policy) заголовки
- XSS Protection
- Frame Options
- HTTPS принудительно
- Безопасные заголовки через Netlify

### Рекомендации:
- Используйте HTTPS домены
- Настройте CORS для API
- Регулярно обновляйте зависимости

## 🚀 Производительность

### Оптимизации:
- Минимизация CSS/JS (для production)
- Кеширование статических ресурсов
- Lazy loading изображений
- Debounce для поиска
- Виртуализация больших списков

### Размеры:
- HTML: ~50KB
- CSS: ~80KB
- JavaScript: ~200KB
- Общий размер: ~330KB (без изображений)

## 🔄 Обновления

### Версионирование
Проект использует семантическое версионирование (SemVer):
- `MAJOR.MINOR.PATCH`
- Текущая версия: 1.0.0

### Changelog
См. [CHANGELOG.md](CHANGELOG.md) для истории изменений.

## 🤝 Участие в разработке

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Создайте Pull Request

### Стандарты кода:
- ES6+ синтаксис
- Модульная архитектура
- Комментарии на русском языке
- Consistent naming conventions

## 📝 Лицензия

Этот проект лицензирован под MIT License - см. [LICENSE](LICENSE) файл для деталей.

## 👨‍💻 Авторы

- **Construction CRM Team** - *Разработка и дизайн*

## 🙏 Благодарности

- [Chart.js](https://www.chartjs.org/) - за отличную библиотеку графиков
- [Font Awesome](https://fontawesome.com/) - за иконки
- [Google Fonts](https://fonts.google.com/) - за шрифты
- [Netlify](https://netlify.com/) - за хостинг

## 📞 Поддержка

Если у вас есть вопросы или нужна помощь:
- 🐛 [Сообщить о баге](https://github.com/your-username/construction-crm/issues)
- 💡 [Предложить улучшение](https://github.com/your-username/construction-crm/issues)
- 📧 Email: support@construction-crm.com

---

**⭐ Поставьте звезду, если проект был полезен!**
