<template>
    <div class="uk-navbar-container uk-navbar-transparent uk-section-primary uk-padding-small">
        <h2>
            {{ period.start.toLocaleString({ month: 'short', day: 'numeric' }) }} - 
            {{ period.end.toLocaleString({ month: 'short', day: 'numeric' }) }}
        </h2>
        <div class="uk-navbar-left">
            <ul class="uk-iconnav">
                <li><a href="#" ref="btnMenu" @click.prevent="menu" uk-icon="icon: menu" uk-tooltip="Menu"></a></li>
                <li><a href="#" ref="btnPrevious" @click.prevent="previous" uk-icon="icon: chevron-left" uk-tooltip="Previous Period"></a></li>
                <li><a href="#" ref="btnCurrent" @click.prevent="current" uk-icon="icon: clock" uk-tooltip="Current Period"></a></li>
                <li><a href="#" ref="btnCalendar" @click.prevent="showCalendar" uk-icon="icon: calendar" uk-tooltip="Select Period"></a></li>
                <li><a href="#" ref="btnNext" @click.prevent="next" uk-icon="icon: chevron-right" uk-tooltip="Next Period"></a></li>
            </ul>
        </div>
        <calendar-dialog ref="calDialog" v-model="period" :startDate="config.startDate" :periodLength="config.periodLength"/>

        <!-- special -->
        <keyboard-event @keyup.alt.left="previous" @keyup.alt.right="next"/>
    </div>
</template>

<script>
import Vue from 'vue';
import Vuex from 'vuex';
import CalendarDialog from './CalendarDialog.vue';
import KeyboardEvent from './KeyboardEvent.vue';
import UIkit from 'uikit';
import Icon from 'uikit/dist/js/uikit-icons';
import { DateTime } from 'luxon';
import { CalculatePeriod } from '../util/date';

UIkit.use(Icon);
Vue.use(Vuex);

export default {
    components: {
        CalendarDialog, KeyboardEvent
    },
    computed: {
        period: {
            get: function() { return this.$store.state.period; },
            set: function(val) { 
                console.log('Setting the period');
                this.$store.commit('set', { key: 'period', value: val });
            }
        },
        ...Vuex.mapState(['config'])
    },
    methods: {
        menu() {
            UIkit.tooltip(this.$refs.btnMenu).hide();
        },
        previous() {
            this.period = CalculatePeriod(this.period.start.minus({ days: this.config.periodLength }), this.config.startDate, this.config.periodLength);
            UIkit.tooltip(this.$refs.btnPrevious).hide();
        },
        next() {
            this.period = CalculatePeriod(this.period.start.plus({ days: this.config.periodLength }), this.config.startDate, this.config.periodLength);
            UIkit.tooltip(this.$refs.btnNext).hide();
        },
        current() {
            this.period = CalculatePeriod(DateTime.today(), this.config.startDate, this.config.periodLength);
            UIkit.tooltip(this.$refs.btnCurrent).hide();
        },
        showCalendar() {
            UIkit.tooltip(this.$refs.btnPCalendar).hide();
            UIkit.modal(this.$refs.calDialog.$el).show();
        },
    },
}
</script>