import EventEmitter from '../util/eventemitter';

/**
 * @typedef {{
 * _key: string,
 * amount: number,
 * cash: boolean,
 * category: string,
 * check: string,
 * date: string,
 * name: string, 
 * note: string,
 * paid: boolean,
 * recurring: string,
 * scheduled: boolean,
 * transfer: boolean
 * }} Transaction
 * 
 * @typedef {{
 * _key: string,
 * amount: number,
 * cash: boolean,
 * category: string,
 * end: string,
 * name: string,
 * note: string,
 * period: string,
 * scheduled: boolean,
 * start: string,
 * transfer: boolean 
 * }} RecurringTransaction
 * 
 * @typedef {{
 * action: "create" | "change" | "delete",
 * final: Transaction | RecurringTransaction,
 * initial?: Transaction | RecurringTransaction,
 * type: "Transaction" | "Recurring"
 * }} HistoryItem
 * 
 * @typedef {{ pointer: number, items: Array<HistoryItem> }} UserHistory
 * 
 * @typedef {Object.<string, UserHistory} History
 * 
 * @typedef {{type: 'event', eventName: 'auth' | 'config' | 'recurring' | 'transaction' | 'history' | 'backup', args: Array}} WorkerData
 */

class Firebase extends EventEmitter {
    constructor() {
        super();

        this._auth = null;
        this._can_undo = false;
        this._can_redo = false;
        this._config = null;

        this._worker = new Worker('/firebase_ww.js');
        this._worker.onmessage = this._handle_message.bind(this);
    }

    _send_message(messageName, ...args) {
        this._worker.postMessage({ type: 'message', messageName, args });
    }

    /**
     * 
     * @param {MessageEvent} evt 
     */
    _handle_message(evt) {
        /** @type {WorkerData} */
        let event = evt.data;

        switch (event.type) {
            case 'event':
                switch(event.eventName) {
                    case 'auth':
                        this._handle_auth(...event.args);
                        break;
                    case 'config':
                        this._handle_config(...event.args);
                        break;
                    case 'recurring':
                        this._handle_recurring(...event.args);
                        break;
                    case 'transaction':
                        this._handle_transaction(...event.args);
                        break;
                    case 'backup':
                        this._handle_backup(...event.args);
                        break;
                    case 'history':
                        this._handle_history(...event.args);
                        break;
                    default:
                        console.error(`ERROR: Invalid event type ${event.eventName}`)
                }
                break;
            default:
                console.error(`ERROR: invalid event type: ${event.type}`);
                break;
        }

    }

    _handle_auth(auth) {
        this._auth = auth;
        this.emit('authStateChanged', this._auth);
    }

    _handle_config(config) {
        this._config = config;
        this.emit('config', config);
    }

    _handle_recurring(recurrings) {
        this.emit('recurring', recurrings);
    }

    _handle_transaction(transactions) {
        this.emit('transaction', transactions);
    }

    _handle_history(canUndo, canRedo) {
        this._can_redo = canRedo;
        this._can_undo = canUndo;
        this.emit('history', this._can_undo, this._can_redo);
    }

    _handle_backup(data) {
        this.emit('backup', data);
    }

    canUndo() {
        if (this.isUserValid) {
            return this._can_undo;
        }
        return false;
    }

    canRedo() {
        if (this.isUserValid) {
            return this.this._can_redo;
        }
        return false;
    }

    get isUserValid() {
        return this._auth !== null;
    }

    get uid() {
        if (this.isUserValid) {
            return this._auth.currentUser.uid;
        }
        return null;
    }

    deleteTransaction(record, storeHistory=true) {
        if (this.isUserValid) {
            this._send_message('deleteTransaction', record, storeHistory);
        }
    }

    saveTransaction(record, storeHistory=true) { 
        if (this.isUserValid) {
            this._send_message('saveTransaction', record, storeHistory);
        }
    }

    saveRecurring(record, storeHistory=true) { 
        if (this.isUserValid) {
            this._send_message('saveRecurring', record, storeHistory);
        }
    }

    undo() {
        if (this.canUndo()) {
            this._send_message('undo');
        }
    }

    redo() {
        if (this.canRedo()) {
            this._send_message('redo');
        }
    }

    saveConfig(data) {
        if (this.isUserValid) {
            this._send_message('saveConfig', data);
        }
    }

    restoreBudget(data) {
        if (this.isUserValid) {
            this._send_message('restoreBudget', data);
        }
    }

    backupBudget() {
        if (this.isUserValid) {
            this._send_message('backupBudget');
        }
    }

    signInWithEmailAndPassword(username, password) {
        this._send_message('signInWithEmailAndPassword', username, password);
    }

    signOut() {
        if (this.isUserValid) {
            this._send_message('signOut');
        }
    }
}

export default new Firebase();