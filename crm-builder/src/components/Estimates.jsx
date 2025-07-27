import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { set, get, del, keys } from 'idb-keyval';

const estimateSchema = yup.object().shape({
  name: yup.string().required('Название обязательно'),
  client: yup.string().required('Клиент обязателен'),
  amount: yup.number().required('Сумма обязательна').min(0),
});

function Estimates() {
  const [estimates, setEstimates] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadEstimates();
  }, []);

  async function loadEstimates() {
    const allKeys = await keys();
    const estKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith('estimate_'));
    const ests = await Promise.all(estKeys.map(k => get(k)));
    setEstimates(ests);
  }

  async function handleDelete(id) {
    await del('estimate_' + id);
    loadEstimates();
  }

  const formik = useFormik({
    initialValues: { name: '', client: '', amount: '' },
    validationSchema: estimateSchema,
    onSubmit: async (values, { resetForm }) => {
      const id = editingId || Date.now().toString();
      await set('estimate_' + id, { ...values, id });
      setEditingId(null);
      resetForm();
      loadEstimates();
    },
    enableReinitialize: true,
  });

  function handleEdit(est) {
    setEditingId(est.id);
    formik.setValues(est);
  }

  function handleCancel() {
    setEditingId(null);
    formik.resetForm();
  }

  return (
    <div>
      <h3>Сметы</h3>
      <form onSubmit={formik.handleSubmit} style={{ marginBottom: 24 }}>
        <input
          name="name"
          placeholder="Название сметы"
          value={formik.values.name}
          onChange={formik.handleChange}
        />
        <input
          name="client"
          placeholder="Клиент"
          value={formik.values.client}
          onChange={formik.handleChange}
        />
        <input
          name="amount"
          type="number"
          placeholder="Сумма"
          value={formik.values.amount}
          onChange={formik.handleChange}
        />
        <button type="submit">{editingId ? 'Сохранить' : 'Добавить'}</button>
        {editingId && <button type="button" onClick={handleCancel}>Отмена</button>}
      </form>
      <table>
        <thead>
          <tr>
            <th>Название</th>
            <th>Клиент</th>
            <th>Сумма</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {estimates.map(est => (
            <tr key={est.id}>
              <td>{est.name}</td>
              <td>{est.client}</td>
              <td>{est.amount}</td>
              <td>
                <button onClick={() => handleEdit(est)}>✏️</button>
                <button onClick={() => handleDelete(est.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Estimates;