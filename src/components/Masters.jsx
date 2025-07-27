import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { set, get, del, keys } from 'idb-keyval';

const masterSchema = yup.object().shape({
  name: yup.string().required('ФИО обязательно'),
  specialty: yup.string().required('Специальность обязательна'),
  phone: yup.string().required('Телефон обязателен'),
  hired: yup.string().required('Дата приёма обязательна'),
});

function Masters() {
  const [masters, setMasters] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadMasters();
  }, []);

  async function loadMasters() {
    const allKeys = await keys();
    const mKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith('master_'));
    const ms = await Promise.all(mKeys.map(k => get(k)));
    setMasters(ms);
  }

  async function handleDelete(id) {
    await del('master_' + id);
    loadMasters();
  }

  const formik = useFormik({
    initialValues: { name: '', specialty: '', phone: '', hired: '' },
    validationSchema: masterSchema,
    onSubmit: async (values, { resetForm }) => {
      const id = editingId || Date.now().toString();
      await set('master_' + id, { ...values, id });
      setEditingId(null);
      resetForm();
      loadMasters();
    },
    enableReinitialize: true,
  });

  function handleEdit(m) {
    setEditingId(m.id);
    formik.setValues(m);
  }

  function handleCancel() {
    setEditingId(null);
    formik.resetForm();
  }

  return (
    <div>
      <h3>Мастера</h3>
      <form onSubmit={formik.handleSubmit} style={{ marginBottom: 24 }}>
        <input
          name="name"
          placeholder="ФИО"
          value={formik.values.name}
          onChange={formik.handleChange}
        />
        <input
          name="specialty"
          placeholder="Специальность"
          value={formik.values.specialty}
          onChange={formik.handleChange}
        />
        <input
          name="phone"
          placeholder="Телефон"
          value={formik.values.phone}
          onChange={formik.handleChange}
        />
        <input
          name="hired"
          type="date"
          value={formik.values.hired}
          onChange={formik.handleChange}
        />
        <button type="submit">{editingId ? 'Сохранить' : 'Добавить'}</button>
        {editingId && <button type="button" onClick={handleCancel}>Отмена</button>}
      </form>
      <table>
        <thead>
          <tr>
            <th>ФИО</th>
            <th>Специальность</th>
            <th>Телефон</th>
            <th>Дата приёма</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {masters.map(m => (
            <tr key={m.id}>
              <td>{m.name}</td>
              <td>{m.specialty}</td>
              <td>{m.phone}</td>
              <td>{m.hired}</td>
              <td>
                <button onClick={() => handleEdit(m)}>✏️</button>
                <button onClick={() => handleDelete(m.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Masters;