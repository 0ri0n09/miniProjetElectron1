const btnUpload = document.getElementById('uploadBtn')
btnUpload.addEventListener('click', () => {
    electronAPI.selectFiles()
})

