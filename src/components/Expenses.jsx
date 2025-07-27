import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { set, get, del, keys } from 'idb-keyval';

const expenseSchema = yup.object().shape({
  date: yup.string().required('Дата обязательна'),
  category: yup.string().required('Категория обязательна'),
  amount: yup.number().required('Сумма обязательна').min(0),
  comment: yup.string(),
});

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadExpenses();
  }, []);

  async function loadExpenses() {
    const allKeys = await keys();
    const expKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith('expense_'));
    const exps = await Promise.all(expKeys.map(k => get(k)));
    setExpenses(exps);
  }

  async function handleDelete(id) {
    await del('expense_' + id);
    loadExpenses();
  }

  const formik = useFormik({
    initialValues: { date: '', category: '', amount: '', comment: '' },
    validationSchema: expenseSchema,
    onSubmit: async (values, { resetForm }) => {
      const id = editingId || Date.now().toString();
      await set('expense_' + id, { ...values, id });
      setEditingId(null);
      resetForm();
      loadExpenses();
    },
    enableReinitialize: true,
  });

  function handleEdit(exp) {
    setEditingId(exp.id);
    formik.setValues(exp);
  }

  function handleCancel() {
    setEditingId(null);
    formik.resetForm();
  }

  return (
    <div>
      <h3>Расходы</h3>
      <form onSubmit={formik.handleSubmit} style={{ marginBottom: 24 }}>
        <input
          name="date"
          type="date"
          value={formik.values.date}
          onChange={formik.handleChange}
        />
        <input
          name="category"
          placeholder="Категория"
          value={formik.values.category}
          onChange={formik.handleChange}
        />
        <input
          name="amount"
          type="number"
          placeholder="Сумма"
          value={formik.values.amount}
          onChange={formik.handleChange}
        />
        <input
          name="comment"
          placeholder="Комментарий"
          value={formik.values.comment}
          onChange={formik.handleChange}
        />
        <button type="submit">{editingId ? 'Сохранить' : 'Добавить'}</button>
        {editingId && <button type="button" onClick={handleCancel}>Отмена</button>}
      </form>
      <table>
        <thead>
          <tr>
            <th>Дата</th>
            <th>Категория</th>
            <th>Сумма</th>
            <th>Комментарий</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {expenses.map(exp => (
            <tr key={exp.id}>
              <td>{exp.date}</td>
              <td>{exp.category}</td>
              <td>{exp.amount}</td>
              <td>{exp.comment}</td>
              <td>
                <button onClick={() => handleEdit(exp)}>✏️</button>
                <button onClick={() => handleDelete(exp.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Expenses;