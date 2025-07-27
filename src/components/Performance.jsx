import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { set, get, del, keys } from 'idb-keyval';

const perfSchema = yup.object().shape({
  masterId: yup.string().required('Мастер обязателен'),
  workTypeId: yup.string().required('Вид работ обязателен'),
  volume: yup.number().required('Объём обязателен').min(0),
  date: yup.string().required('Дата обязательна'),
});

function Performance() {
  const [performance, setPerformance] = useState([]);
  const [masters, setMasters] = useState([]);
  const [workTypes, setWorkTypes] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadPerformance();
    loadMasters();
    loadWorkTypes();
  }, []);

  async function loadPerformance() {
    const allKeys = await keys();
    const perfKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith('performance_'));
    const perfs = await Promise.all(perfKeys.map(k => get(k)));
    setPerformance(perfs);
  }
  async function loadMasters() {
    const allKeys = await keys();
    const mKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith('master_'));
    const ms = await Promise.all(mKeys.map(k => get(k)));
    setMasters(ms);
  }
  async function loadWorkTypes() {
    const allKeys = await keys();
    const wtKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith('worktype_'));
    const wts = await Promise.all(wtKeys.map(k => get(k)));
    setWorkTypes(wts);
  }

  async function handleDelete(id) {
    await del('performance_' + id);
    loadPerformance();
  }

  const formik = useFormik({
    initialValues: { masterId: '', workTypeId: '', volume: '', date: '' },
    validationSchema: perfSchema,
    onSubmit: async (values, { resetForm }) => {
      const id = editingId || Date.now().toString();
      await set('performance_' + id, { ...values, id });
      setEditingId(null);
      resetForm();
      loadPerformance();
    },
    enableReinitialize: true,
  });

  function handleEdit(perf) {
    setEditingId(perf.id);
    formik.setValues(perf);
  }

  function handleCancel() {
    setEditingId(null);
    formik.resetForm();
  }

  return (
    <div>
      <h3>Производительность мастеров</h3>
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
        <select
          name="workTypeId"
          value={formik.values.workTypeId}
          onChange={formik.handleChange}
        >
          <option value="">Вид работ</option>
          {workTypes.map(wt => (
            <option key={wt.id} value={wt.id}>{wt.name}</option>
          ))}
        </select>
        <input
          name="volume"
          type="number"
          placeholder="Объём"
          value={formik.values.volume}
          onChange={formik.handleChange}
        />
        <input
          name="date"
          type="date"
          value={formik.values.date}
          onChange={formik.handleChange}
        />
        <button type="submit">{editingId ? 'Сохранить' : 'Добавить'}</button>
        {editingId && <button type="button" onClick={handleCancel}>Отмена</button>}
      </form>
      <table>
        <thead>
          <tr>
            <th>Мастер</th>
            <th>Вид работ</th>
            <th>Объём</th>
            <th>Дата</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {performance.map(perf => (
            <tr key={perf.id}>
              <td>{masters.find(m => m.id === perf.masterId)?.name || ''}</td>
              <td>{workTypes.find(wt => wt.id === perf.workTypeId)?.name || ''}</td>
              <td>{perf.volume}</td>
              <td>{perf.date}</td>
              <td>
                <button onClick={() => handleEdit(perf)}>✏️</button>
                <button onClick={() => handleDelete(perf.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Performance;