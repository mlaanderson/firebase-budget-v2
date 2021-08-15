<template>
    <div id="app">
        <!-- <button class="uk-button uk-button-default" v-on:click="increment">Clicked {{ count }} times</button> -->
        <div>
            <calculator-input ref="cinput" :decimals="2" name="blah" v-model="cvalue"/> {{value}}
        </div>
        <p><button class="uk-button uk-button-default" @click="showCalendar">Click</button></p>
        <calendar-dialog ref="calDialog" v-model="period" :startDate="config.startDate" :periodLength="config.periodLength"/>
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
        CalculatorInput, CalendarDialog
    },
    store,
    methods: {
        increment() {
            this.$store.commit('increment');
            console.log(this.$store.state.count);
        },
        showCalendar() {
            UIkit.modal(this.$refs.calDialog.$el).show();
        },
    },
    computed: {
        cvalue: {
            get: function() { return this.$store.state.value; },
            set: function(val) { this.$store.commit('setValue', val); }
        },
        period: {
            get: function() { return this.$store.state.period; },
            set: function(val) { this.$store.commit('set', {key: 'period', value: val})}
        },
        ...Vuex.mapState(['count', 'value', 'config'])
    },
    beforeCreate() {
        console.log('Creating...');
        console.log(this.$refs)
    }
}
</script>

<style>
    @import url(https://cdn.jsdelivr.net/npm/uikit@3.7.2/dist/css/uikit.min.css);
</style>
