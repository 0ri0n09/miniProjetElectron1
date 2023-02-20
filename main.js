const { app, BrowserWindow, ipcMain, dialog, nativeTheme, shell } = require('electron');
const path = require('path');
const ProgressBar = require('electron-progressbar');
const Button = require("./button");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true
    }
  });

  const pngquant = require('pngquant-bin');
  const execFile = require('child_process').execFile;
  const os = require('os');
  const fs = require('fs');

  ipcMain.on('selected-files', (event, files) => {
    dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', "multiSelections"],
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
        const progressBar = new ProgressBar({
          indeterminate: false,
          title: 'Compression de fichier',
          text: 'Compression ...',
          detail: 'Veuillez patienter ...',
          browserWindow: {
            parent: mainWindow,
            modal: true,
            closable: false,
            minimizable: false,
            maximizable: false,
            resizable: false
          }
        });

        progressBar
            .on('completed', () => {
              progressBar.detail = 'Compression terminée !';
              dialog.showMessageBox({
                type: 'warning',
                title: 'Info Compression',
                message: 'Compression terminée !'
              })
            })
            .on('aborted', () => {
              console.error('Annulé');
              dialog.showMessageBox({
                type: 'warning',
                title: 'Info Compression',
                message: 'Erreur lors de la compression :/'
              })
            });

        let progress = 0;
        progressBar.value = progress;

        filePaths.forEach((filePath, index) => {
          const fileName = path.basename(filePath);
          const compressedFilePath = path.join(compressedFilesDir, fileName);
          setTimeout(() => {
            const child = execFile(pngquant, ['-o', compressedFilePath, filePath]);
            child.stdout.on('data', (data) => {
              console.log(`stdout: ${data}`);
            });
            child.stderr.on('data', (data) => {
              console.error(`stderr: ${data}`);
            });
            child.on('close', (code) => {
              console.log(`child process exited with code ${code}`);
              progress += 1 / filePaths.length;
              progressBar.value = progress;
              if (index === filePaths.length - 1) {
                progressBar.setCompleted();
                shell.openPath(compressedFilesDir);
              }
            });
          }, (index + 1) * 1000);
        });
      }
    }).catch(err => {
      console.log(err)
    });
  });

  mainWindow.loadFile('index.html')
  nativeTheme.themeSource = "dark";
}

app.on('ready', createWindow);

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
