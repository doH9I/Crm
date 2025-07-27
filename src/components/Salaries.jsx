import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { set, get, del, keys } from 'idb-keyval';

const salarySchema = yup.object().shape({
  masterId: yup.string().required('Мастер обязателен'),
  amount: yup.number().required('Сумма обязательна').min(0),
  date: yup.string().required('Дата обязательна'),
  comment: yup.string(),
});

function Salaries() {
  const [salaries, setSalaries] = useState([]);
  const [masters, setMasters] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadSalaries();
    loadMasters();
  }, []);

  async function loadSalaries() {
    const allKeys = await keys();
    const salKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith('salary_'));
    const sals = await Promise.all(salKeys.map(k => get(k)));
    setSalaries(sals);
  }
  async function loadMasters() {
    const allKeys = await keys();
    const mKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith('master_'));
    const ms = await Promise.all(mKeys.map(k => get(k)));
    setMasters(ms);
  }

  async function handleDelete(id) {
    await del('salary_' + id);
    loadSalaries();
  }

  const formik = useFormik({
    initialValues: { masterId: '', amount: '', date: '', comment: '' },
    validationSchema: salarySchema,
    onSubmit: async (values, { resetForm }) => {
      const id = editingId || Date.now().toString();
      await set('salary_' + id, { ...values, id });
      setEditingId(null);
      resetForm();
      loadSalaries();
    },
    enableReinitialize: true,
  });

  function handleEdit(sal) {
    setEditingId(sal.id);
    formik.setValues(sal);
  }

  function handleCancel() {
    setEditingId(null);
    formik.resetForm();
  }

  return (
    <div>
      <h3>Зарплаты</h3>
      <form onSubmit={formik.handleSubmit} style={{ marginBottom: 24 }}>
        <select
          name="masterId"
          value={formik.values.masterId}
          onChange={formik.handleChange}
        >
          <option value="">Мастер</option>
          {masters.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        <input
          name="amount"
          type="number"
          placeholder="Сумма"
          value={formik.values.amount}
          onChange={formik.handleChange}
        />
        <input
          name="date"
          type="date"
          value={formik.values.date}
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
            <th>Мастер</th>
            <th>Сумма</th>
            <th>Дата</th>
            <th>Комментарий</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {salaries.map(sal => (
            <tr key={sal.id}>
              <td>{masters.find(m => m.id === sal.masterId)?.name || ''}</td>
              <td>{sal.amount}</td>
              <td>{sal.date}</td>
              <td>{sal.comment}</td>
              <td>
                <button onClick={() => handleEdit(sal)}>✏️</button>
                <button onClick={() => handleDelete(sal.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Salaries;