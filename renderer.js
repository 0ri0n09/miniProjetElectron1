const btnUpload = document.getElementById('uploadBtn');
const progressBar = document.getElementById('progress-bar');

btnUpload.addEventListener('click', () => {
    electronAPI.selectFiles().then(() => {
        progressBar.value = 1;
    });
});

ipcRenderer.on('compression-progress', (event, progress) => {
    progressBar.value = progress;
});
