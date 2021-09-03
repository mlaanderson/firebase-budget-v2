import { DateTime } from 'luxon';
import ofx from 'node-ofx-parser';


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

/**
 * 
 * @typedef {{ TRNTYPE: string, DTPOSTED: string, TRNAMT: string, FITID: string, NAME: string, MEMO: string}} OfxTransaction
 * @typedef {{type: string, posted: DateTime, amount: number, name: string, memo: string }} Transaction
 * 
 * @param {string} text OFX or QFX text data
 * @returns {Array<Transaction>}
 */
function ParseOfx(text) {
    let data = ofx.parse(text);
    if ('OFX' in data && 
        'BANKMSGSRSV1' in data.OFX && 
        'STMTTRNRS' in data.OFX.BANKMSGSRSV1) {
        // check the status message
        if (data.OFX.BANKMSGSRSV1.STMTTRNRS.STATUS && data.OFX.BANKMSGSRSV1.STMTTRNRS.STATUS.CODE === "0") {
            if ('STMTRS' in data.OFX.BANKMSGSRSV1.STMTTRNRS &&
                'BANKTRANLIST' in data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS &&
                'STMTTRN' in data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKTRANLIST) {
                // this is the list of transactions
                /** @type {Array<OfxTransaction>} */
                let raw = data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKTRANLIST.STMTTRN;
                return {
                    ledgerBalance: {
                        date: DateTime.fromFormat(data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.LEDGERBAL.DTASOF.substr(0,8), 'yyyyMMdd'),
                        amount: parseFloat(data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.LEDGERBAL.BALAMT)
                    },
                    availBalance: {
                        date: DateTime.fromFormat(data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.AVAILBAL.DTASOF.substr(0,8), 'yyyyMMdd'),
                        amount: parseFloat(data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.AVAILBAL.BALAMT)
                    },
                    transactions: raw.map(otr => {
                    return {
                        type: otr.TRNTYPE,
                        posted: DateTime.fromFormat(otr.FITID.substr(0,8), 'yyyyMMdd'),
                        id: otr.FITID,
                        amount: parseFloat(otr.TRNAMT),
                        name: otr.NAME,
                        memo: otr.MEMO
                    };
                })};
            } else {
                console.log('ERROR: Did not find transactions in data', data.OFX.BANKMSGSRSV1.STMTTRNRS);
            }
        } else {
            console.log('ERROR: Did not find status or invalid status in data', data.OFX.BANKMSGSRSV1.STMTTRNRS);
        }
    } else {
        console.log('ERROR: Did not find OFX.BANKMSGSRSV1.STMTTRNRS in data', data);
    }
    return null;
}

export {
    Download, Upload, ParseOfx
}