import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyDhs0mPVlovk6JHnEdv6HeU2jy3M8VRoSk",
    authDomain: "budget-dacac.firebaseapp.com",
    databaseURL: "https://budget-dacac.firebaseio.com",
    storageBucket: "budget-dacac.appspot.com"
};

firebase.default.initializeApp(firebaseConfig);

// database and auth
const DB = firebase.default.database();
const AUTH = firebase.default.auth();

class Firebase {
    constructor() {
        
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

    saveTransaction(record) { 
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

            if (result.key) {
                return this.transactions.child(result.key).set(result.rec);
            } else {
                return this.transactions.push(result.rec);
            }
        }
    }

    saveRecurring(record) { 
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

            if (result.key) {
                return this.recurring.child(result.key).set(result.rec);
            } else {
                return this.recurring.push(result.rec);
            }
        }
    }
}

export default new Firebase();