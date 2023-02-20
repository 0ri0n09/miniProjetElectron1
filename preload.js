const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    selectFiles: () => ipcRenderer.send("selected-files")
})