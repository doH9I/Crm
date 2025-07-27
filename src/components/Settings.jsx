import React from 'react';
import { keys, get, set, del } from 'idb-keyval';

function Settings() {
  async function handleExport() {
    const allKeys = await keys();
    const allData = {};
    for (const k of allKeys) {
      allData[k] = await get(k);
    }
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crm-data.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const data = JSON.parse(text);
    for (const k in data) {
      await set(k, data[k]);
    }
    window.location.reload();
  }

  async function handleReset() {
    if (window.confirm('Удалить все данные?')) {
      const allKeys = await keys();
      for (const k of allKeys) {
        await del(k);
      }
      window.location.reload();
    }
  }

  return (
    <div>
      <h3>Настройки</h3>
      <button onClick={handleExport}>Экспорт данных</button>
      <input type="file" accept="application/json" onChange={handleImport} />
      <button onClick={handleReset} style={{ color: 'red' }}>Сбросить все данные</button>
    </div>
  );
}

export default Settings;