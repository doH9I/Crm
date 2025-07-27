import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { set, get, del, keys } from 'idb-keyval';

const materialSchema = yup.object().shape({
  name: yup.string().required('Наименование обязательно'),
  unit: yup.string().required('Ед. изм. обязательна'),
  quantity: yup.number().required('Количество обязательно').min(0),
  price: yup.number().required('Цена за ед. обязательна').min(0),
});

function Warehouse() {
  const [materials, setMaterials] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadMaterials();
  }, []);

  async function loadMaterials() {
    const allKeys = await keys();
    const matKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith('material_'));
    const mats = await Promise.all(matKeys.map(k => get(k)));
    setMaterials(mats);
  }

  async function handleDelete(id) {
    await del('material_' + id);
    loadMaterials();
  }

  const formik = useFormik({
    initialValues: { name: '', unit: '', quantity: '', price: '' },
    validationSchema: materialSchema,
    onSubmit: async (values, { resetForm }) => {
      const id = editingId || Date.now().toString();
      await set('material_' + id, { ...values, id });
      setEditingId(null);
      resetForm();
      loadMaterials();
    },
    enableReinitialize: true,
  });

  function handleEdit(mat) {
    setEditingId(mat.id);
    formik.setValues(mat);
  }

  function handleCancel() {
    setEditingId(null);
    formik.resetForm();
  }

  return (
    <div>
      <h3>Складской учёт</h3>
      <form onSubmit={formik.handleSubmit} style={{ marginBottom: 24 }}>
        <input
          name="name"
          placeholder="Наименование"
          value={formik.values.name}
          onChange={formik.handleChange}
        />
        <input
          name="unit"
          placeholder="Ед. изм. (кг, м, шт, ... )"
          value={formik.values.unit}
          onChange={formik.handleChange}
        />
        <input
          name="quantity"
          type="number"
          placeholder="Количество"
          value={formik.values.quantity}
          onChange={formik.handleChange}
        />
        <input
          name="price"
          type="number"
          placeholder="Цена за ед."
          value={formik.values.price}
          onChange={formik.handleChange}
        />
        <button type="submit">{editingId ? 'Сохранить' : 'Добавить'}</button>
        {editingId && <button type="button" onClick={handleCancel}>Отмена</button>}
      </form>
      <table>
        <thead>
          <tr>
            <th>Наименование</th>
            <th>Ед. изм.</th>
            <th>Количество</th>
            <th>Цена за ед.</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {materials.map(mat => (
            <tr key={mat.id}>
              <td>{mat.name}</td>
              <td>{mat.unit}</td>
              <td>{mat.quantity}</td>
              <td>{mat.price}</td>
              <td>
                <button onClick={() => handleEdit(mat)}>✏️</button>
                <button onClick={() => handleDelete(mat.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Warehouse;