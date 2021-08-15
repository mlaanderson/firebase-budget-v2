<template>
    <div id="app">
        <!-- <button class="uk-button uk-button-default" v-on:click="increment">Clicked {{ count }} times</button> -->
        <div>
            <calculator-input ref="cinput" :decimals="2" name="blah" v-model="cvalue"/> {{value}}
        </div>
        <p><button class="uk-button uk-button-default" @click="logout">Logout</button></p>
        <calendar-dialog ref="calDialog" v-model="period" :startDate="config.startDate" :periodLength="config.periodLength"/>
        <login-dialog ref="loginDialog"/>
    </div>
</template>

<script>
import Vue from 'vue';
import Vuex from 'vuex';
import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
import Firebase from './data/firebase';
import CalculatorInput from './components/CalculatorInput.vue';
import CalendarDialog from './components/CalendarDialog.vue';
import LoginDialog from './components/LoginDialog.vue';
import { DateTime, Duration } from 'luxon';
import { CalculatePeriod } from './util/date';

Vue.use(Vuex);
UIkit.use(Icons);

window.firebase = Firebase;
window.DateTime = DateTime;
window.Duration = Duration;
window.CalculatePeriod = CalculatePeriod;

// This will be the firebase store...move to another module?
const store = new Vuex.Store({
    state: {
        count: 0,
        transactions: null,
        recurring: null,
        value: 1,
        period: { start: DateTime.fromISO('2021-08-13').startOf('day'), end: DateTime.fromISO('2021-08-26').startOf('day') },
        config: {
            periodLength: 14,
            startDate: DateTime.fromISO('2016-06-24').startOf('day'),
            categories: ["Income", "Charity", "Saving", "Housing", "Utilities", "Food", "Clothing", "Transportation", "Medical", "Personal", "Education", "Recreation", "Debt"]
        }
    },
    mutations: {
        increment: state => state.count++,
        decrement: state => state.count--,
        setValue: (state, val) => state.value = val,
        set: (state, val) => state[val.key] = val.value
    }
});

// This mixin makes uikit available in all components
Vue.mixin({
    data: function() {
        return {
            get UIkit() {
                return UIkit;
            }
        }
    }
});

export default {
    name: 'App',
    components: {
        CalculatorInput, LoginDialog, CalendarDialog
    },
    store,
    methods: {
        showDialog() {
            UIkit.modal(this.$refs.loginDialog.$el).show();
        },
        logout() {
            Firebase.auth.signOut();
        }
    },
    computed: {
        cvalue: {
            get: function() { return this.$store.state.value; },
            set: function(val) { this.$store.commit('setValue', val); }
        },
        period: {
            get: function() { return this.$store.state.period; },
            set: function(val) { 
                console.log('Setting the period');
                this.$store.commit('set', {key: 'period', value: val});
            }
        },
        ...Vuex.mapState(['count', 'value', 'config'])
    },
    beforeCreate() {

    }
}
</script>

<style>
    @import url(https://cdn.jsdelivr.net/npm/uikit@3.7.2/dist/css/uikit.min.css);
</style>
