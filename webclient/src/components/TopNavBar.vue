<template>
    <div class="uk-navbar-container uk-navbar-transparent uk-section-primary uk-padding-small" uk-navbar>
        <div class="uk-navbar-left">
            <ul class="uk-iconnav">
                <li><a href="#" ref="btnMenu" @click.prevent="menu" uk-icon="icon: menu" uk-tooltip="Menu"></a></li>
                <li><a href="#" ref="btnPrevious" @click.prevent="previous" uk-icon="icon: chevron-left" uk-tooltip="Previous Period"></a></li>
                <li><a href="#" ref="btnCurrent" @click.prevent="current" uk-icon="icon: clock" uk-tooltip="Current Period"></a></li>
                <li><a href="#" ref="btnCalendar" @click.prevent="showCalendar" uk-icon="icon: calendar" uk-tooltip="Select Period"></a></li>
                <li><a href="#" ref="btnNext" @click.prevent="next" uk-icon="icon: chevron-right" uk-tooltip="Next Period"></a></li>
            </ul>
        </div>
        <div class="uk-navbar-center">
            {{ period.start.toLocaleString({ month: 'short', day: 'numeric' }) }} 
            <span class="uk-visible@s">- {{ period.end.toLocaleString({ month: 'short', day: 'numeric' }) }}</span>
        </div>
        <div class="uk-navbar-right">
            <ul class="uk-iconnav">
                <li><a href="#" ref="btnAddTransaction" @click.prevent="addTransaction" uk-icon="icon: plus" uk-tooltip="Add New Transaction"></a></li>
                <li><a href="#" ref="btnAddRecurring" @click.prevent="addRecurring" uk-icon="icon: future" uk-tooltip="Add New Recurring Transaction"></a></li>
            </ul>
        </div>

        <!-- menu -->
        <div ref="menuNav" uk-offcanvas="overlay: true">
            <div class="uk-offcanvas-bar">
                <button class="uk-offcanvas-close" type="button" uk-close></button>
                <ul class="uk-nav uk-nav-default">
                    <li><a href="#" @click.prevent="inactive('search')"><span class="uk-margin-small-right" uk-icon="icon: search"/>Search</a></li>
                    <li><a href="#" @click.prevent="inactive('cash')"><span class="uk-margin-small-right" uk-icon="icon: fa-regular-money-bill-alt"/>Cash</a></li>
                    
                    <li class="uk-nav-divider"></li>
                    
                    <li><a href="#" @click.prevent="inactive('undo')"><span class="uk-margin-small-right" uk-icon="icon: history"/>Undo</a></li>
                    <li><a href="#" @click.prevent="inactive('redo')"><span class="uk-margin-small-right" uk-icon="icon: future"/>Redo</a></li>
                    
                    <li class="uk-nav-header">Charts</li>
                    <li><a href="#" @click.prevent="inactive('chart-spending')"><span class="uk-margin-small-right" uk-icon="icon: fa-regular-chart-bar"/> Period Spending</a></li>
                    <li><a href="#" @click.prevent="inactive('chart-year-spending')"><span class="uk-margin-small-right" uk-icon="icon: fa-regular-chart-bar"/> Year to Date Spending</a></li>

                    <li class="uk-nav-header">Exports</li>
                    <li><a href="#" @click.prevent="inactive('backup')"><span class="uk-margin-small-right" uk-icon="icon: download"/> Download Backup</a></li>
                    <li><a href="#" @click.prevent="inactive('restore')"><span class="uk-margin-small-right" uk-icon="icon: upload"/> Restore Backup</a></li>
                    <li><a href="#" @click.prevent="inactive('spreadsheet')"><span class="uk-margin-small-right" uk-icon="icon: pull"/> Download Spreadsheet</a></li>
                    <li><a href="#" @click.prevent="inactive('spreadsheet-period')"><span class="uk-margin-small-right" uk-icon="icon: pull"/> Download Period Spreadsheet</a></li>
                    
                    <!-- <li class="uk-nav-header">Wizards</li>
                    <li class="uk-nav-header">Settings</li> -->
                    
                    <li class="uk-nav-divider"></li>
                    
                    <li><a href="#" @click.prevent="logout"><span class="uk-margin-small-right" uk-icon="icon: sign-out"></span> Sign Out</a></li>
                </ul>

            </div>
        </div>

        <!-- dialogs -->
        <calendar-dialog ref="calDialog" v-model="period" :startDate="config.startDate" :periodLength="config.periodLength"/>

        <!-- special -->
        <keyboard-event 
            @keydown.ctrl.left.prevent="previous" 
            @keydown.meta.left.prevent="previous" 
            @keydown.ctrl.right.prevent="next"
            @keydown.meta.right.prevent="next"

            @keydown.ctrl.z.prevent="inactive('undo')"
            @keydown.meta.z.prevent="inactive('undo')"
            @keydown.ctrl.y.prevent="inactive('redo')"
            @keydown.meta.y.prevent="inactive('redo')"

            @keydown.ctrl.f.prevent="inactive('search')"
            @keydown.meta.f.prevent="inactive('search')"

        />
    </div>
</template>

<script>
import Vue from 'vue';
import Vuex from 'vuex';
import Firebase from '../data/firebase';
import CalendarDialog from './CalendarDialog.vue';
import KeyboardEvent from './KeyboardEvent.vue';
import UIkit from 'uikit';
import Icon from 'uikit/dist/js/uikit-icons';
import UIkitFAAllIcons from '@septdirworkshop/ukfontawesome/dist/js/uikit-fa-all-icons';
import { DateTime } from 'luxon';
import { CalculatePeriod } from '../util/date';

UIkit.use(Icon);
UIkit.use(UIkitFAAllIcons);
Vue.use(Vuex);

export default {
    components: {
        CalendarDialog, KeyboardEvent
    },
    computed: {
        period: {
            get: function() { return this.$store.state.period; },
            set: function(val) { 
                this.$store.commit('set', { key: 'period', value: val });
            }
        },
        ...Vuex.mapState(['config'])
    },
    methods: {
        inactive(str="") {
            console.log(`Inactive${str !== '' ? ': ' + str : ''}`);
        },
        menu() {
            UIkit.tooltip(this.$refs.btnMenu).hide();
            UIkit.offcanvas(this.$refs.menuNav).show();
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
        addTransaction() {

        },
        addRecurring() {

        },
        logout() {
            Firebase.auth.signOut();
        }
    },
}
</script>