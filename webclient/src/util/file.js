function Download(data, filename, type) {
    let blob = new Blob([data], { type: type });

    if (window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(blob, filename);
    } else {
        let elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        elem.style.display = 'none';
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
}

function Upload(accept=null) {
    return new Promise((resolve, reject) => {
        let filePicker = document.createElement('input');
        filePicker.type = 'file';
        filePicker.style = 'display:none';
        if (accept) {
            filePicker.accept = accept;
        }

        filePicker.addEventListener('change', () => {
            let files = filePicker.files;
            if (files.length > 0) {
                let fr = new FileReader();
                fr.addEventListener('load', () => {
                    try {
                        resolve(fr.result);
                    } catch {
                        reject('Error reading file');
                    }
                    filePicker.remove();
                });
                fr.readAsText(files[0]);
            } else {
                reject('No file chosen');
                filePicker.remove();
            }
        });

        document.body.append(filePicker);
        filePicker.click();
    });
}

export {
    Download, Upload
}