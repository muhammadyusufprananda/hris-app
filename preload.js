const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('hris', {
  karyawan: {
    getAll: (opts) => ipcRenderer.invoke('karyawan:getAll', opts),
    getOne: (id) => ipcRenderer.invoke('karyawan:getOne', id),
    create: (data) => ipcRenderer.invoke('karyawan:create', data),
    update: (data) => ipcRenderer.invoke('karyawan:update', data),
    delete: (id) => ipcRenderer.invoke('karyawan:delete', id),
    stats: () => ipcRenderer.invoke('karyawan:stats'),
    export: () => ipcRenderer.invoke('karyawan:export'),
    getDistinct: (field) => ipcRenderer.invoke('karyawan:getDistinct', field),
  }
});
