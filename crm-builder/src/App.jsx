import React, { useState } from 'react';
import './App.css';
import Estimates from './components/Estimates';
import WorkTypes from './components/WorkTypes';
import Expenses from './components/Expenses';
import Incomes from './components/Incomes';
import Masters from './components/Masters';
import Performance from './components/Performance';
import Salaries from './components/Salaries';
import Warehouse from './components/Warehouse';
import Reports from './components/Reports';
import Settings from './components/Settings';

const sections = [
  { key: 'estimates', label: 'Сметы' },
  { key: 'workTypes', label: 'Виды работ' },
  { key: 'expenses', label: 'Расходы' },
  { key: 'incomes', label: 'Доходы' },
  { key: 'masters', label: 'Мастера' },
  { key: 'performance', label: 'Производительность' },
  { key: 'salaries', label: 'Зарплаты' },
  { key: 'warehouse', label: 'Склад' },
  { key: 'reports', label: 'Отчёты' },
  { key: 'settings', label: 'Настройки' },
];

function App() {
  const [activeSection, setActiveSection] = useState('estimates');

  return (
    <div className="crm-container">
      <aside className="crm-sidebar">
        <h2>CRM Строительство</h2>
        <nav>
          <ul>
            {sections.map((section) => (
              <li
                key={section.key}
                className={activeSection === section.key ? 'active' : ''}
                onClick={() => setActiveSection(section.key)}
              >
                {section.label}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="crm-main">
        <SectionRenderer section={activeSection} />
      </main>
    </div>
  );
}

function SectionRenderer({ section }) {
  switch (section) {
    case 'estimates':
      return <Estimates />;
    case 'workTypes':
      return <WorkTypes />;
    case 'expenses':
      return <Expenses />;
    case 'incomes':
      return <Incomes />;
    case 'masters':
      return <Masters />;
    case 'performance':
      return <Performance />;
    case 'salaries':
      return <Salaries />;
    case 'warehouse':
      return <Warehouse />;
    case 'reports':
      return <Reports />;
    case 'settings':
      return <Settings />;
    default:
      return <div>Раздел не найден</div>;
  }
}

export default App;
