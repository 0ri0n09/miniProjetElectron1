const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { shell } = require('electron');

let mainWindow;
function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true
    }
  })

  const pngquant = require('pngquant-bin');
  const execFile = require('child_process').execFile;
  const os = require('os');
  const fs = require('fs');
  ipcMain.on('selected-files', (event, files) => {
    dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['png'] }
      ]
    }).then(result => {
      if (!result.canceled) {
        const filePaths = result.filePaths;
        const tmpDir = os.tmpdir();
        const compressedFilesDir = path.join(tmpDir, 'compressed-files');
        if (!fs.existsSync(compressedFilesDir)) {
          fs.mkdirSync(compressedFilesDir);
        }
        filePaths.forEach(filePath => {
          const fileName = path.basename(filePath);
          const compressedFilePath = path.join(compressedFilesDir, fileName);
          execFile(pngquant, ['-o', compressedFilePath, filePath], (error, stdout, stderr) => {
            if (error) {
              console.error(error);
            }
          });
        });
        shell.openPath(compressedFilesDir);
      }
    }).catch(err => {
      console.log(err)
    });
  });
  mainWindow.loadFile('index.html')
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});