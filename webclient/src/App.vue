<template>
    <div id="app">
        <p>
            <button class="uk-button uk-button-default" @click="logout">Logout</button>
            <button class="uk-button uk-button-default" @click="showCalendar">Period</button>
        </p>
        <ol>
            <li v-for="transaction in periodTransactions" :key="transaction._key">
                {{ transaction.name }}
                {{ currency(transaction.amount) }}
                {{ transaction.paid ? "" : "NOT PAID" }}
            </li>
        </ol>
        <p>{{ currency(budgetBalance) }}</p>
        <p>{{ currency(bankBalance) }}</p>

        <!-- dialogs -->
        <calendar-dialog ref="calDialog" v-model="period" :startDate="config.startDate" :periodLength="config.periodLength"/>
        <login-dialog ref="loginDialog"/>
    </div>
</template>

<script>
import Vue from 'vue';
import Vuex from 'vuex';
import store from './data/store';
import UIkit from 'uikit';
import Firebase from './data/firebase';
import CalendarDialog from './components/CalendarDialog.vue';
import LoginDialog from './components/LoginDialog.vue';
import { DateTime, Duration } from 'luxon';
import { CalculatePeriod } from './util/date';
import { Currency } from './util/formats';

Vue.use(Vuex);

window.firebase = Firebase;
window.DateTime = DateTime;
window.Duration = Duration;
window.CalculatePeriod = CalculatePeriod;

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
        LoginDialog, CalendarDialog
    },
    store,
    methods: {
        showCalendar() {
            UIkit.modal(this.$refs.calDialog.$el).show();
        },
        logout() {
            Firebase.auth.signOut();
        },
        currency(value) {
            return Currency.format(value);
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
        ...Vuex.mapGetters(['periodTransactions', 'budgetBalance', 'bankBalance']),
        ...Vuex.mapState(['value', 'config'])
    },
    beforeCreate() {
        document.title = 'Anderson Budget';
    }
}
</script>

<style>
    @import url(https://cdn.jsdelivr.net/npm/uikit@3.7.2/dist/css/uikit.min.css);
</style>
