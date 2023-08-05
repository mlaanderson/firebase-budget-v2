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
 * @typedef { 'deleteTransaction' | 'saveTransaction' | 'saveRecurring' | 
 *      'undo' | 'redo' | 'saveConfig' | 'restoreBudget' | 'backupBudget' | 
 *       'signOut' | 'signInWithEmailAndPassword'} MessageNames
 *
 * @typedef {{ type: 'message', messageName: MessageNames, args: Array }} Message
 */

const firebaseConfig = {
    apiKey: "AIzaSyDhs0mPVlovk6JHnEdv6HeU2jy3M8VRoSk",
    authDomain: "budget-dacac.firebaseapp.com",
    databaseURL: "https://budget-dacac.firebaseio.com",
    storageBucket: "budget-dacac.appspot.com"
};

var window = {};
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase.js');
firebase.initializeApp(firebaseConfig);

// database and auth
const DB = firebase.default.database();
const AUTH = firebase.default.auth();

class Firebase {
    constructor() {
        // super();
        /** @type {History} */
        this._history = {};
        this._pointer = -1;
        this._transactionTimer = -1;
        this._transactionData = {};
        if (window.localStorage) {
            try {
                this._history = JSON.parse(localStorage.getItem('budget2.history')) || {};
            } catch {
                this._history = {};
            }
        }

        this.auth.onAuthStateChanged(auth => {
            if (auth) {
                // set the pointer
                if (this.uid in this._history === false) {
                    // create the entry
                    this._history[this.uid] = {
                        pointer: 0,
                        items: []
                    }
                }
                this._pointer = this._history[this.uid].items.length;
                this.emit('auth', {uid: auth.uid, email: auth.email});
                this.emit('history', this.canUndo(), this.canRedo());
                setTimeout(() => {
                    this.db.ref(`${this.uid}/config`).on('value', this.onConfig.bind(this));
                    this.db.ref(`${this.uid}/accounts/budget/transactions`).on('value', this.onTransaction.bind(this));
                    this.db.ref(`${this.uid}/accounts/budget/recurring`).on('value', this.onRecurring.bind(this));
                }, 500);
            } else {
                this._pointer = -1;
                this.emit('auth', null);
            }
        });

        onmessage = this._handle_message.bind(this);
    }

    /**
     * 
     * @param {MessageEvent} ev 
     */
    _handle_message(ev) {
        /** @type {Message} */
        let event = ev.data;
        if (event.type !== 'message') {
            console.error(`ERROR: invalid message type ${event.type}`);
            return;
        }

        switch (event.messageName) {
            case 'backupBudget':
                this.backupBudget(...event.args);
                break;
            case 'deleteTransaction':
                this.deleteTransaction(...event.args);
                break;
            case 'saveTransaction':
                this.saveTransaction(...event.args);
                break;
            case 'saveRecurring':
                this.saveRecurring(...event.args);
                break;
            case 'undo':
                this.undo();
                break;
            case 'redo':
                this.redo();
                break;
            case 'saveConfig':
                this.saveConfig(...event.args);
                break;
            case 'restoreBudget':
                this.restoreBudget(...event.args);
                break;
            case 'signOut':
                this.signOut();
                break;
            case 'signInWithEmailAndPassword':
                this.signInWithEmailAndPassword(...event.args);
                break;
            default:
                console.error(`ERROR: invalid message ${event.messageName}`);
                break;
        }
    }


    onConfig(snap) {
        this.emit('config', snap.val());
    }

    onTransaction(snap) {
        this._transactionData = {...this._transactionData, ...snap.val()};
        clearTimeout(this._transactionTimer);
        this._transactionTimer = setTimeout(() => {
            this.emit('transaction', this._transactionData);
            this._transactionData = {};
        }, 50);
    }

    onRecurring(snap) {
        this.emit('recurring', snap.val());
    }

    /**
     * 
     * @param {string} eventName 
     * @param  {...any} args 
     */
    emit(eventName, ...args) {
        postMessage({type: 'event', eventName, args})
    }

    _saveHistory() {
        if (window.localStorage) {
            localStorage.setItem('budget2.history', JSON.stringify(this._history));
        }
        this.emit('history', this.canUndo(), this.canRedo());
    }

    /** @type {UserHistory} */
    get history() {
        if (this.isUserValid) {
            return this._history[this.uid];
        }
        return {
            pointer: 0,
            items: []
        };
    }

    canUndo() {
        if (this.isUserValid) {
            return this.history.pointer > 0;
        }
        return false;
    }

    canRedo() {
        if (this.isUserValid) {
            return this.history.pointer < this.history.items.length;
        }
        return false;
    }

    get db() {
        return DB;
    }

    get transactions() {
        if (this.isUserValid) {
            return this.db.ref(`${this.uid}/accounts/budget/transactions`);
        }
        return null;
    }

    get recurring() {
        if (this.isUserValid) {
            return this.db.ref(`${this.uid}/accounts/budget/recurring`);
        }
        return null;
    }

    get auth() {
        return AUTH;
    }

    get isUserValid() {
        return this.auth.currentUser !== null;
    }

    get uid() {
        if (this.isUserValid) {
            return this.auth.currentUser.uid;
        }
        return null;
    }

    async signOut() {
        if (this.isUserValid) {
            await this.auth.signOut();
        }
    }

    async signInWithEmailAndPassword(username, password) {
        try {
            await this.auth.signInWithEmailAndPassword(username, password);
        } catch (e) {
            console.log(e);
        }
    }

    async deleteTransaction(record, storeHistory=true) {
        if (this.isUserValid) {
            if (storeHistory) {
                /** @type {HistoryItem} */
                let hItem = {
                    action: 'delete',
                    type: 'Transaction',
                    final: JSON.parse(JSON.stringify(record))
                };
                // delete any redo items (index > pointer) because history has changed
                this.history.items.splice(this.history.pointer);
                this.history.items.push(hItem);
                this.history.pointer = this.history.items.length;

                this._saveHistory();
            }
            await this.transactions.child(record._key).remove();
        }
    }

    async saveTransaction(record, storeHistory=true) { 
        if (this.isUserValid) {
            let result = {
                key: record._key,
                rec: {
                    amount: record.amount,            
                    category: record.category,
                    date: record.date,
                    name: record.name,
                    note: record.note || ""
                }
            };
        
            if (record.cash) result.rec.cash = record.cash;
            if (record.check) result.rec.check = record.check;
            if (record.paid) result.rec.paid = record.paid;
            if (record.scheduled) result.rec.scheduled = record.scheduled;
            if (record.recurring) result.rec.recurring = record.recurring;
            if (record.transfer) result.rec.transfer = record.transfer;

            /** @type {HistoryItem} */
            let hItem = {
                action: record._key ? 'change' : 'create',
                type: 'Transaction',
                final: { _key: record._key, ...result.rec }
            }

            if (result.key) {
                // fetch the initial
                if (storeHistory) {
                    let snap = await this.transactions.child(result.key).get();
                    hItem.initial = { _key: snap.key, ...snap.val() };
                }
                await this.transactions.child(result.key).set(result.rec);
            } else {
                let ref = await this.transactions.push(result.rec);
                hItem.final._key = ref.key;
            }
            if (storeHistory) {
                // delete any redo items (index > pointer) because history has changed
                this.history.items.splice(this.history.pointer);
                this.history.items.push(hItem);
                this.history.pointer = this.history.items.length;

                this._saveHistory();
            }
        }
    }

    async saveRecurring(record, storeHistory=true) { 
        if (this.isUserValid) {
            let result = {
                key: record._key,
                rec: {
                    amount: record.amount,            
                    category: record.category,
                    start: record.start,
                    end: record.end,
                    period: record.period,
                    name: record.name,
                    note: record.note || ""
                }
            };
        
            if (record.cash) result.rec.cash = record.cash;
            if (record.scheduled) result.rec.scheduled = record.scheduled;
            if (record.transfer) result.rec.transfer = record.transfer;
            if (record.active) result.rec.active = record.active;
            if (record.delete) result.rec.delete = record.delete;

            /** @type {HistoryItem} */
            let hItem = {
                action: record._key ? 'change' : 'create',
                type: 'Recurring',
                final: { _key: record._key, ...result.rec }
            }
            

            if (result.key) {
                if (storeHistory) {
                    let snap = await this.recurring.child(result.key).get();
                    hItem.initial = { _key: snap.key, ...snap.val() };
                }
                await this.recurring.child(result.key).set(result.rec);
            } else {
                let ref = await this.recurring.push(result.rec);
                hItem.final._key = ref.key;
            }

            if (storeHistory) {
                // delete any redo items (index > pointer) because history has changed
                this.history.items.splice(this.history.pointer);
                this.history.items.push(hItem);
                this.history.pointer = this.history.items.length;

                this._saveHistory();
            }
        }
    }

    async undo() {
        if (this.canUndo()) {
            this.history.pointer--;
            let hItem = this.history.items[this.history.pointer];
            if (hItem.type === 'Transaction') {
                switch (hItem.action) {
                    case 'change':
                        await this.saveTransaction(hItem.initial, false);
                        break;
                    case 'create':
                        await this.deleteTransaction(hItem.final, false);
                        break;
                    case 'delete':
                        await this.saveTransaction(hItem.final, false);
                        break;
                }
            } else if (hItem.type === 'Recurring') {
                switch (hItem.action) {
                    case 'change':
                        await this.saveRecurring(hItem.initial, false);
                        break;
                    case 'create':
                        {
                            // swap active and delete
                            let record = JSON.parse(JSON.stringify(hItem.final));
                            record.delete = record.active;
                            delete record.active;
                            await this.saveRecurring(record, false);
                        }
                        break;
                    case 'delete':
                        await this.saveRecurring(hItem.final, false);
                        break;
                }
            }
        }
        this._saveHistory();
    }

    async redo() {
        if (this.canRedo()) {
            let hItem = this.history.items[this.history.pointer];
            this.history.pointer++;
            if (hItem.type === 'Transaction') {
                switch (hItem.action) {
                    case 'change':
                    case 'delete':
                        await this.saveTransaction(hItem.final, false);
                        break;
                    case 'create':
                        await this.deleteTransaction(hItem.final, false);
                        break;
                }
            } else if (hItem.type === 'Recurring') {
                await this.saveRecurring(hItem.final, false);
            }
        }
        this._saveHistory();
    }

    async saveConfig(data) {
        if (this.isUserValid) {
                await this.db.ref(`${this.uid}/config`).set(data);

        }
    }

    async restoreBudget(data) {
        if (this.isUserValid) {
            try {
                console.log(data);
                await this.db.ref(`${this.uid}/accounts/budget`).set(data);
            } catch {
                // do what?
            }
        }
    }

    async backupBudget(...args) {
        if (this.isUserValid) {
            let backup = await this.db.ref(`${this.uid}`).get();
            this.emit('backup', backup.val(), ...args);
        }
    }
}

let worker_db = new Firebase();
