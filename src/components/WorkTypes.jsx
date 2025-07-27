import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { set, get, del, keys } from 'idb-keyval';

const workTypeSchema = yup.object().shape({
  name: yup.string().required('Название обязательно'),
  unit: yup.string().required('Ед. изм. обязательна'),
});

function WorkTypes() {
  const [workTypes, setWorkTypes] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadWorkTypes();
  }, []);

  async function loadWorkTypes() {
    const allKeys = await keys();
    const wtKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith('worktype_'));
    const wts = await Promise.all(wtKeys.map(k => get(k)));
    setWorkTypes(wts);
  }

  async function handleDelete(id) {
    await del('worktype_' + id);
    loadWorkTypes();
  }

  const formik = useFormik({
    initialValues: { name: '', unit: '' },
    validationSchema: workTypeSchema,
    onSubmit: async (values, { resetForm }) => {
      const id = editingId || Date.now().toString();
      await set('worktype_' + id, { ...values, id });
      setEditingId(null);
      resetForm();
      loadWorkTypes();
    },
    enableReinitialize: true,
  });

  function handleEdit(wt) {
    setEditingId(wt.id);
    formik.setValues(wt);
  }

  function handleCancel() {
    setEditingId(null);
    formik.resetForm();
  }

  return (
    <div>
      <h3>Виды работ</h3>
      <form onSubmit={formik.handleSubmit} style={{ marginBottom: 24 }}>
        <input
          name="name"
          placeholder="Название вида работ"
          value={formik.values.name}
          onChange={formik.handleChange}
        />
        <input
          name="unit"
          placeholder="Ед. изм. (м2, шт, ... )"
          value={formik.values.unit}
          onChange={formik.handleChange}
        />
        <button type="submit">{editingId ? 'Сохранить' : 'Добавить'}</button>
        {editingId && <button type="button" onClick={handleCancel}>Отмена</button>}
      </form>
      <table>
        <thead>
          <tr>
            <th>Название</th>
            <th>Ед. изм.</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {workTypes.map(wt => (
            <tr key={wt.id}>
              <td>{wt.name}</td>
              <td>{wt.unit}</td>
              <td>
                <button onClick={() => handleEdit(wt)}>✏️</button>
                <button onClick={() => handleDelete(wt.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default WorkTypes;