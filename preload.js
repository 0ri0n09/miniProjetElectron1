const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    //setTitle: (title) => ipcRenderer.send('set-title', title),
    //test: () => ipcRenderer.send("selected-files")
    selectFiles: () => ipcRenderer.send("selected-files")
})