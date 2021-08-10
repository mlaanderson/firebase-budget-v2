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
}

export default new Firebase();