import Firebase from './firebase';
import Vue from 'vue';
import Vuex from 'vuex';
import { DateTime, Duration } from 'luxon';
import { CalculatePeriod } from '../util/date';

Vue.use(Vuex);

window.Firebase = Firebase;

const store = new Vuex.Store({
    /**
     * Populate state with some default values to avoid errors
     */
    state: {
        value: 0,
        transactions: [],
        recurring: [],
        period: { start: DateTime.fromISO('2021-08-13').startOf('day'), end: DateTime.fromISO('2021-08-26').startOf('day') },
        config: {
            periodLength: 7,
            startDate: DateTime.fromISO('2016-06-17').startOf('day'),
            categories: ["Income"],
            theme: "default"
        },
        configuration: {
            categories: [], 
            periods: {
                length: "",
                start: "2016-06-17"
            },
            theme: "default"
        },
        canUndo: false,
        canRedo: false
    },
    mutations: {
        setValue: (state, val) => state.value = val,
        set: (state, val) => state[val.key] = val.value,
        setConfig: (state, val) => state.config[val.key] = val.value,
        setConfiguration: (state, val) => state.configuration[val.key] = val.value,
        
    },
    getters: {
        periodTransactions: state => {
            // strings in the form of YYYY-MM-DD, faster than converting every
            // transaction date into DateTime object
            let start = state.period.start.toISODate();
            let end = state.period.end.toISODate();
            let result = [];
            if (state.transactions) {
                let unsorted = state.transactions.filter(tr => (start <= tr.date) && (tr.date <= end));
                // sort by category, then name, then amount (desc)
                for (let category of state.config.categories) {
                    result.push(...unsorted.filter(tr => tr.category === category)
                    .sort((a,b) => {
                        if (a.name.localeCompare(b.name) == 0) {
                            return b.amount - a.amount;
                        }
                        return a.name.localeCompare(b.name);
                    }));
                }
            }
            
            return result;                
        },
        budgetBalance: state => {
            let end = state.period.end.toISODate();
            if (state.transactions) {
                return state.transactions.filter(tr => (tr.date <= end))
                    .map(tr => tr.amount)
                    .reduce((a,b) => a+ b, 0);
            }
            return 0;
        },
        bankBalance: state => {
            let end = state.period.end.toISODate();

            if (state.transactions) {
                return state.transactions.filter(tr => (tr.date <= end) && (tr.paid))
                    .map(tr => tr.amount)
                    .reduce((a,b) => a + b, 0);
            }
            return 0;
        },
        dailyBalances: state => {
            let result = {};
            for (let tr of state.transactions) {
                if (tr.date in result === false) {
                    result[tr.date] = tr.amount;
                } else {
                    result[tr.date] += tr.amount;
                }
            }
            result = Object.entries(result).map(el => { return { date: el[0], amount: el[1] }});
            result.sort((a,b) => a.date.localeCompare(b.date));
            let total = 0;
            result.forEach(d => {
                total += d.amount;
                d.amount = total;
            });

            return result;
        }
    }
});

/**
 * Returns a list of transactions that match the passed structure
 * @param {Object.<string,number|string|boolean} matches 
 * @returns {Array}
 */
store.findTransactions = function(matches) {
    if (this.state.transactions) {
        return this.state.transactions.filter(tr => {
            for (let key in matches) {
                if (!(key in tr) || (tr[key] !== matches[key])) {
                    return false;
                }
            }
            return true;
        });
    }
    return [];
}

store.findText = function(text) {
    if (this.state.transactions) {
        return this.state.transactions.filter(tr => {
            return (tr.name.toUpperCase().indexOf(text.toUpperCase()) > -1) || (tr.note && (tr.note.toUpperCase().indexOf(text.toUpperCase()) > -1));
        }).sort((a,b) => a.date.localeCompare(b.date));
    }
    return [];
}

/**
 * Loads configuration changes into the store when changed
 * @param {DataSnapshot} snap Firebase snapshot
 */
function onConfig(snap) {
    let config = snap.val();
    let periodLength = Duration.fromNatural(config.periods.length).as('days');
    let startDate = DateTime.fromISO(config.periods.start).startOf('day');
    store.commit('setConfig', { key: 'categories', value: config.categories });
    store.commit('setConfig', { key: 'periodLength', value: periodLength });
    store.commit('setConfig', { key: 'startDate', value: startDate });
    store.commit('setConfiguration', {key: 'categories', value: config.categories});
    store.commit("setConfiguration", {key: 'periods', value: {
        length: config.periods.length,
        start: config.periods.start,
    }});
    store.commit('set', { key: 'period', value: CalculatePeriod(DateTime.today(), startDate, periodLength) });
}

function onTransaction(snap) {
    let transactions = snap.val();
    let result = [];
    for (let key in transactions) {
        result.push({ _key: key, ...transactions[key] });
    }
    store.commit('set', { key: 'transactions', value: result });
}

function onRecurring(snap) {
    let recurrings = snap.val();
    let result = [];
    for (let key in recurrings) {
        result.push({ _key: key, ...recurrings[key] });
    }
    store.commit('set', { key: 'recurring', value: result });
}

Firebase.auth.onAuthStateChanged((auth) => {
    if (auth) {
        // get ready to populate the state
        Firebase.db.ref(`${Firebase.uid}/config`).on('value', onConfig);
        Firebase.db.ref(`${Firebase.uid}/accounts/budget/transactions`).on('value', onTransaction);
        Firebase.db.ref(`${Firebase.uid}/accounts/budget/recurring`).on('value', onRecurring);
    } else {
        // empty the state
        store.commit('setConfig', { key: 'categories', value: ['Income'] });
        store.commit('set', { key: 'transactions', value: [] });
    }
});

// configure the store for firebase undo/redo
Firebase.store = store;

export default store;