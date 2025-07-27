import React, { useEffect, useState } from 'react';
import { keys, get } from 'idb-keyval';

function Reports() {
  const [summary, setSummary] = useState({
    expenses: 0,
    incomes: 0,
    salaries: 0,
    profit: 0,
    warehouse: [],
  });

  useEffect(() => {
    loadSummary();
  }, []);

  async function loadSummary() {
    const allKeys = await keys();
    const expenses = (await Promise.all(
      allKeys.filter(k => typeof k === 'string' && k.startsWith('expense_')).map(k => get(k))
    )).reduce((sum, e) => sum + (e?.amount ? Number(e.amount) : 0), 0);
    const incomes = (await Promise.all(
      allKeys.filter(k => typeof k === 'string' && k.startsWith('income_')).map(k => get(k))
    )).reduce((sum, i) => sum + (i?.amount ? Number(i.amount) : 0), 0);
    const salaries = (await Promise.all(
      allKeys.filter(k => typeof k === 'string' && k.startsWith('salary_')).map(k => get(k))
    )).reduce((sum, s) => sum + (s?.amount ? Number(s.amount) : 0), 0);
    const warehouse = await Promise.all(
      allKeys.filter(k => typeof k === 'string' && k.startsWith('material_')).map(k => get(k))
    );
    setSummary({
      expenses,
      incomes,
      salaries,
      profit: incomes - expenses - salaries,
      warehouse,
    });
  }

  return (
    <div>
      <h3>Отчёты</h3>
      <div>Суммарные расходы: <b>{summary.expenses}</b></div>
      <div>Суммарные доходы: <b>{summary.incomes}</b></div>
      <div>Суммарные зарплаты: <b>{summary.salaries}</b></div>
      <div>Прибыль: <b>{summary.profit}</b></div>
      <h4>Остатки на складе</h4>
      <table>
        <thead>
          <tr>
            <th>Наименование</th>
            <th>Ед. изм.</th>
            <th>Количество</th>
            <th>Цена за ед.</th>
          </tr>
        </thead>
        <tbody>
          {summary.warehouse.map(mat => (
            <tr key={mat.id}>
              <td>{mat.name}</td>
              <td>{mat.unit}</td>
              <td>{mat.quantity}</td>
              <td>{mat.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Reports;