import Firebase from './firebase';
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const LH_KEY = 'BUDGET_HISTORY';




/** 
 * @typedef {{ 
 *      _key: string,
 *      amount: number, 
 *      cash?: boolean, 
 *      category: string, 
 *      check?: string, 
 *      date: string, 
 *      name: string, 
 *      note?: string, 
 *      paid?: boolean, 
 *      scheduled?: boolean, 
 *      recurring?: string, 
 *      transfer?: boolean 
 * }} Transaction
 * @typedef {{ 
 *      _key: string,
 *      active?: string, 
 *      amount: number, 
 *      cash?: boolean, 
 *      category: string, 
 *      delete?: string, 
 *      end: string, 
 *      name: string, 
 *      note?: string, 
 *      period: string, 
 *      scheduled?: boolean,
 *      start: string, 
 *      transfer?: boolean 
 * }} RecurringTransaction
 * @typedef {{ action: "create" | "change" | "delete", type: "Transaction" | "Recurring", initial?: Transaction | RecurringTransaction, final: Transaction | RecurringTransaction }} HistoryItem 
 * @typedef {{ pointer: number, events: Array<HistoryItem> }} UserHistory
 * @typedef {{ history: Object.<string, UserHistory> }} HistoryState
 */

/**
 * 
 * @param {Transaction | RecurringTransaction} record 
 * @returns 
 */
 function toFirebase(record) {
    let result = {
        key: record._key,
        rec: {
            amount: record.amount,            
            category: record.category,
            date: record.date,
            name: record.name
        }
    };

    if (record.cash) result.rec.cash = record.cash;
    if (record.check) result.rec.check = record.check;
    if (record.note) result.rec.note = record.note;
    if (record.paid) result.rec.note = record.paid;
    if (record.scheduled) result.rec.note = record.scheduled;
    if (record.recurring) result.rec.note = record.recurring;
    if (record.transfer) result.rec.note = record.transfer;
    if (record.active) result.rec.note = record.active;
    if (record.delete) result.rec.note = record.delete;
    if (record.end) result.rec.note = record.end;
    if (record.period) result.rec.note = record.period;
    if (record.start) result.rec.note = record.start;
}

const store = new Vuex.Store({
    /** @type {HistoryState} */
    state: {
        history: {}
    },
    mutations: {
        /**
         * 
         * @param {HistoryState} state 
         */
        initializeStore(state) {
            if (window.localStorage && localStorage.getItem(LH_KEY)) {
                this.replaceState(Object.assign(state, JSON.parse(localStorage.getItem(LH_KEY))));
            }
        },
        /**
         * 
         * @param {HistoryState} state 
         * @param {UserHistory} history 
         */
        setUserHistory(state, history) {
            if (Firebase.isUserValid) {
                state.history[Firebase.uid] = history;
            }
        },
        /**
         * 
         * @param {HistoryState} state 
         * @param {HistoryItem} event 
         */
        push(state, event) {
            if (Firebase.isUserValid) {
                // clear out redos
                state.history[Firebase.uid].events.splice(state.history[Firebase.uid].pointer);
                // push the new event
                state.history[Firebase.uid].events.push(event);

                // remove early events to limit history to 100
                if (state.history[Firebase.uid].events.length > 100) {
                    state.history[Firebase.uid].events.splice(0, state.history[Firebase.uid].events.length - 100)
                }

                // update the pointer
                state.history[Firebase.uid].pointer = state.history[Firebase.uid].events.length;
            }
        },
        /**
         * 
         * @param {HistoryState} state 
         */
        undo(state) {
            if (Firebase.isUserValid) {
                let history = state.history[Firebase.uid];
                if (history.pointer > 0) {
                    let event = history.events[history.pointer - 1];
                    history.pointer--;

                    switch(event.action) {
                        case 'change':
                            // revert to the initial if it exists
                            if (event.initial) {
                                if (event.start && event.end) {
                                    // recurring
                                } else {
                                    let fbrec = toFirebase(event.initial);
                                    Firebase.transactions.ref(fbrec.key).set(fbrec.rec);
                                }
                            }
                            break;
                        case 'create':
                            if (event.start && event.end) {
                                // recurring
                            } else {
                                Firebase.transactions.ref(event.final._key).remove();
                            }
                            break;
                        case 'delete':
                            if (event.start && event.end) {
                                // recurring
                            } else {
                                let fbrec = toFirebase(event.final);
                                Firebase.transactions.ref(fbrec.key).set(fbrec.rec);
                            }
                            break;
                    }
                }
            }
        },
        redo(state) {
            if (Firebase.isUserValid) {
                let history = state.history[Firebase.uid];
                if (history.pointer < history.events.length) {
                    let event = history.events[history.pointer];
                    history.pointer++;

                    switch(event.action) {
                        case 'change':
                            break;
                        case 'create':
                            break;
                        case 'delete':
                            break;
                    }
                }
            }            
        }
    },
    getters: {
        /**
         * 
         * @param {HistoryState} state 
         * @returns {UserHistory}
         */
        history: (state) => {
            if (Firebase.isUserValid) {
                if (Firebase.uid in state.history === false) {
                    store.commit('setUserHistory', {
                        pointer: 0,
                        events: []
                    });
                }
                return store.history[Firebase.uid];
            }
            return {
                pointer: 0,
                events: []
            }
        },
        canUndo: (state) => {
            if (Firebase.isUserValid) {
                return state.history[Firebase.uid].pointer > 0;
            }
            return false;
        },
        canRedo: (state) => {
            if (Firebase.isUserValid) {
                return state.history[Firebase.uid].pointer < state.history[Firebase.uid].events.length;
            }
            return false;
        }
    }

});

store.subscribe((mutation, state) => {
    if (window.localStorage) {
        localStorage.setItem(LH_KEY, JSON.stringify(state));
    }
});

store.commit('initializeStore');

export default store;