import Firebase from './firebase';
import Vue from 'vue';
import Vuex from 'vuex';
import { DateTime, Duration } from 'luxon';
import { CalculatePeriod } from '../util/date';
import { Download } from '../util/file';

Vue.use(Vuex);

const store = new Vuex.Store({
    /**
     * Populate state with some default values to avoid errors
     */
    state: {
        auth: null,
        username: 'Not logged in',
        transactions: [],
        recurring: [],
        period: { start: DateTime.fromISO('2021-08-13').startOf('day'), end: DateTime.fromISO('2021-08-26').startOf('day') },
        theme: 'default',
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
        },
        transactionNames: state => {
            return [...new Set(state.transactions.map(tr => tr.name))];
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

store.saveConfig =  function(config) {
    Firebase.saveConfig(config);
}

store.deleteRecurring =  function(transaction) {
    transaction.delete = this.state.period.start.toISODate();
    Firebase.saveRecurring(transaction);
}

store.saveRecurring = function(transaction) {
    try {
        // set the active date so the server knows to create the transactions
        transaction.active = this.state.period.start.toISODate();
        Firebase.saveRecurring(transaction);
    } catch(error) {
        console.log('ERROR:', error);
    }
}

store.deleteTransaction = function(transaction) {
    Firebase.deleteTransaction(transaction);
}

store.saveTransaction = function(transaction) {
    Firebase.saveTransaction(transaction);
}

store.undo = function() {
    Firebase.undo();
}

store.redo = function() {
    Firebase.redo();
}

store.logout = function() {
    Firebase.signOut();
}

store.backup = function() {
    Firebase.backupBudget();
}

function onBackup(data) {
    let stringData = JSON.stringify(data);
    let filename = `budget-${this.state.period.start.toISODate()}.json`;

    Download(stringData, filename, 'application/json');
}

store.restore = function(data) {
    Firebase.restoreBudget(data)
}

/**
 * Loads configuration changes into the store when changed
 * @param {DataSnapshot} snap Firebase snapshot
 */
function onConfig(config) {
    let periodLength = Duration.fromNatural(config.periods.length).as('days');
    let startDate = DateTime.fromISO(config.periods.start).startOf('day');
    store.commit('set', { key: 'config', value: {
        categories: config.categories,
        periodLength: periodLength,
        startDate: startDate,
        theme: config.theme
    }});
    store.commit('set', {key: 'configuration', value: {
        categories: config.categories,
        periods: {
            length: config.periods.length,
            start: config.periods.start
        },
        theme: config.theme
    }});
    store.commit('set', { key: 'period', value: CalculatePeriod(DateTime.today(), startDate, periodLength) });
    store.commit('set', { key: 'theme', value: config.theme });
}

/**
amount : number;
cash? : boolean;
category : string;
check? : string;
date : string;
name : string;
note? : string;
paid?: boolean;
scheduled?: boolean;
recurring? : string;
transfer? : boolean;
*/
function onTransaction(transactions) {
    let result = [];
    for (let key in transactions) {
        result.push({ 
            _key: key, 
            cash: false,
            check: "",
            note: "",
            paid: false,
            scheduled: false,
            recurring: "",
            transfer: false,
            ...transactions[key] 
        });
    }
    store.commit('set', { key: 'transactions', value: result });
}

/*
    amount : number;
    cash? : boolean;
    category : string;
    end : string;
    name : string;
    note? : string;
    period : string;
    start : string;
    transfer? : boolean;
    active?: string;
    delete?: string;
    scheduled?: boolean;
*/
function onRecurring(recurrings) {
    let result = [];
    for (let key in recurrings) {
        result.push({ 
            _key: key, 
            cash: false,
            note: "",
            transfer: false,
            scheduled: false,
            ...recurrings[key] 
        });
    }
    store.commit('set', { key: 'recurring', value: result });
}

Firebase.on('authStateChanged', (auth) => {
    if (auth) {
        // get ready to populate the state
        Firebase.on('config', onConfig);
        Firebase.on('transaction', onTransaction);
        Firebase.on('recurring', onRecurring);
        Firebase.on('backup', onBackup);
        store.commit('set', { key: 'username', value: auth.email });
    } else {
        // disable listeners
        Firebase.off('config');
        Firebase.off('transaction');
        Firebase.off('recurring');
        Firebase.off('backup');
        // empty the state
        store.commit('setConfig', { key: 'categories', value: ['Income'] });
        store.commit('set', { key: 'transactions', value: [] });
        store.commit('set', { key: 'username', value: "Not logged in" });
    }
    store.commit('set', { key: 'auth', auth });
});

// Configure the handler for history
Firebase.on('history', (canUndo, canRedo) => {
    store.commit('set', { key: 'canUndo', value: canUndo });
    store.commit('set', { key: 'canRedo', value: canRedo });
});

export default store;