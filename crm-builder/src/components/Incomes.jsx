import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { set, get, del, keys } from 'idb-keyval';

const incomeSchema = yup.object().shape({
  date: yup.string().required('Дата обязательна'),
  source: yup.string().required('Источник обязателен'),
  amount: yup.number().required('Сумма обязательна').min(0),
  comment: yup.string(),
});

function Incomes() {
  const [incomes, setIncomes] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadIncomes();
  }, []);

  async function loadIncomes() {
    const allKeys = await keys();
    const incKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith('income_'));
    const incs = await Promise.all(incKeys.map(k => get(k)));
    setIncomes(incs);
  }

  async function handleDelete(id) {
    await del('income_' + id);
    loadIncomes();
  }

  const formik = useFormik({
    initialValues: { date: '', source: '', amount: '', comment: '' },
    validationSchema: incomeSchema,
    onSubmit: async (values, { resetForm }) => {
      const id = editingId || Date.now().toString();
      await set('income_' + id, { ...values, id });
      setEditingId(null);
      resetForm();
      loadIncomes();
    },
    enableReinitialize: true,
  });

  function handleEdit(inc) {
    setEditingId(inc.id);
    formik.setValues(inc);
  }

  function handleCancel() {
    setEditingId(null);
    formik.resetForm();
  }

  return (
    <div>
      <h3>Доходы</h3>
      <form onSubmit={formik.handleSubmit} style={{ marginBottom: 24 }}>
        <input
          name="date"
          type="date"
          value={formik.values.date}
          onChange={formik.handleChange}
        />
        <input
          name="source"
          placeholder="Источник"
          value={formik.values.source}
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
            <th>Источник</th>
            <th>Сумма</th>
            <th>Комментарий</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {incomes.map(inc => (
            <tr key={inc.id}>
              <td>{inc.date}</td>
              <td>{inc.source}</td>
              <td>{inc.amount}</td>
              <td>{inc.comment}</td>
              <td>
                <button onClick={() => handleEdit(inc)}>✏️</button>
                <button onClick={() => handleDelete(inc.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Incomes;