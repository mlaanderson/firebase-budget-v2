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
        <div class="uk-visible@s uk-navbar-center">
            {{ period.start.toLocaleString({ month: 'short', day: 'numeric' }) }} -
            {{ period.end.toLocaleString({ month: 'short', day: 'numeric' }) }}
        </div>
        <div class="uk-navbar-right">
            <span class="uk-hidden@s">
                {{ period.start.toLocaleString({ month: 'numeric', day: 'numeric' }) }} - 
                {{ period.end.toLocaleString({ month: 'numeric', day: 'numeric' }) }}&nbsp;
            </span>
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
                    <li><button class="uk-button-text" @click.prevent="search"><span class="uk-margin-small-right" uk-icon="icon: search"/>Search</button></li>
                    <li><button class="uk-button-text" @click.prevent="showCash"><span class="uk-margin-small-right" uk-icon="icon: fa-regular-money-bill-alt"/>Cash</button></li>
                    
                    <li><button class="uk-button-text" @click.prevent="transfer"><span class="uk-margin-small-right" uk-icon="icon: forward"/>Transfer</button></li>
                    <li><button class="uk-button-text" @click.prevent="reconcile"><span class="uk-margin-small-right" uk-icon="icon: database"/>Reconcile</button></li>

                    <li class="uk-nav-divider"></li>
                    
                    <li><button class="uk-button-text" :disabled="!canUndo" @click.prevent="undo"><span class="uk-margin-small-right" uk-icon="icon: history"/>Undo</button></li>
                    <li><button class="uk-button-text" :disabled="!canRedo" @click.prevent="redo"><span class="uk-margin-small-right" uk-icon="icon: future"/>Redo</button></li>
                    
                    <li class="uk-nav-header">Charts</li>
                    <li><button class="uk-button-text" @click.prevent="periodSpending"><span class="uk-margin-small-right" uk-icon="icon: fa-regular-chart-bar"/> Period Spending</button></li>
                    <li><button class="uk-button-text" @click.prevent="yearSpending"><span class="uk-margin-small-right" uk-icon="icon: fa-regular-chart-bar"/> Year to Date Spending</button></li>                   

                    <li class="uk-nav-header">Exports</li>
                    <li><button class="uk-button-text" @click.prevent="backup"><span class="uk-margin-small-right" uk-icon="icon: download"/> Download Backup</button></li>
                    <li><button class="uk-button-text" @click.prevent="restore"><span class="uk-margin-small-right" uk-icon="icon: upload"/> Restore Backup</button></li>
                    <li><button class="uk-button-text" @click.prevent="spreadsheet"><span class="uk-margin-small-right" uk-icon="icon: pull"/> Download Spreadsheet</button></li>
                    <li><button class="uk-button-text" @click.prevent="spreadsheetPeriod"><span class="uk-margin-small-right" uk-icon="icon: pull"/> Download Period Spreadsheet</button></li>
                    
                    <li class="uk-nav-divider"></li>
                    
                    <li class="uk-nav-header">Account</li>
                    <li><span ref="username" class="uk-margin-small-right" uk-icon="icon: user"/> {{ username }}</li>

                    <li><button class="uk-button-text" @click.prevent="configuration"><span class="uk-margin-small-right" uk-icon="icon: cog"/> Configuration</button></li>
                    
                    <li><button class="uk-button-text" @click.prevent="logout"><span class="uk-margin-small-right" uk-icon="icon: sign-out"></span> Sign Out</button></li>
                </ul>

            </div>
        </div>

        <!-- dialogs -->
        <calendar-dialog ref="calDialog" v-model="period" :startDate="config.startDate" :periodLength="config.periodLength"/>
        <cash-dialog ref="cashDialog"/>
        <search-dialog ref="searchDialog"/>
        <config ref="configDialog"/>
        <chart-dialog ref="chartDialog"/>
        <reconcile-dialog ref="reconcileDialog"/>

        <!-- special -->
        <keyboard-event 
            @keydown.ctrl.left.prevent="previous" 
            @keydown.meta.left.prevent="previous" 
            @keydown.ctrl.right.prevent="next"
            @keydown.meta.right.prevent="next"

            @keydown.ctrl.z.prevent="undo"
            @keydown.meta.z.prevent="undo"
            @keydown.ctrl.y.prevent="redo"
            @keydown.meta.y.prevent="redo"

            @keydown.ctrl.f.prevent="search"
            @keydown.meta.f.prevent="search"

        />
    </div>
</template>

<style scoped>
    button.uk-button-text {
        border-style: none !important;
        cursor: pointer;
    }
    button.uk-button-text:disabled {
        cursor: default;
    }
</style>

<script>
import Vue from 'vue';
import Vuex from 'vuex';
import CalendarDialog from './CalendarDialog.vue';
import CashDialog from './CashDialog.vue';
import KeyboardEvent from './KeyboardEvent.vue';
import UIkit from 'uikit';
import Icon from 'uikit/dist/js/uikit-icons';
import UIkitFAAllIcons from '@septdirworkshop/ukfontawesome/dist/js/uikit-fa-all-icons';
import { DateTime } from 'luxon';
import { CalculatePeriod } from '../util/date';
import SearchDialog from './SearchDialog.vue';
import { Download, Upload } from '../util/file';
import { Currency } from '../util/formats';
import Config from './Config.vue';
import ChartDialog from './ChartDialog.vue';
import ReconcileDialog from './ReconcileDialog.vue';

UIkit.use(Icon);
UIkit.use(UIkitFAAllIcons);
Vue.use(Vuex);

export default {
    components: {
        CalendarDialog, CashDialog, KeyboardEvent,
        SearchDialog,
        Config,
        ChartDialog,
        ReconcileDialog
    },
    computed: {
        period: {
            get: function() { return this.$store.state.period; },
            set: function(val) { 
                this.$store.commit('set', { key: 'period', value: val });
            }
        },
        canUndo() {
            return this.$store.state.canUndo;
        },
        canRedo() {
            return this.$store.state.canRedo;
        },
        ...Vuex.mapState(['config', 'transactions', 'username']),
        ...Vuex.mapGetters(['periodTransactions'])
    },
    methods: {
        inactive(str="") {
            console.log(`Inactive${str !== '' ? ': ' + str : ''}`);
        },
        undo() {
            this.$store.undo();
            UIkit.offcanvas(this.$refs.menuNav).hide();
        },        
        redo() {
            this.$store.redo();
            UIkit.offcanvas(this.$refs.menuNav).hide();
        },
        configuration(){
            this.$refs.configDialog.show();
        },
        showCash() {
            UIkit.offcanvas(this.$refs.menuNav).hide();
            let result = {
                '100.00': 0,
                '50.00': 0,
                '20.00': 0,
                '10.00': 0,
                '5.00': 0,
                '1.00': 0,
                '0.25': 0,
                '0.10' : 0,
                '0.05': 0,
                '0.01': 0,
                total: 0
            };

            if (this.periodTransactions) {
                let trs = this.periodTransactions.filter(tr => (tr.cash === true) && (tr.amount < 0));
                for (let tr of trs) {
                    let amount = Math.abs(tr.amount);
                    result.total += amount;
                    for (let k of [100.00, 50.00, 20.00, 10.00, 5.00, 1.00, 0.25, 0.10, 0.05]) {
                        let qty = Math.floor(amount / k);
                        if (qty > 0) {
                            let key = k.toFixed(2);
                            result[key] += qty;
                            amount -= qty * k;
                        }
                    }
                    result['0.01'] += Math.round(amount / 0.01);
                }
            }
            this.$refs.cashDialog.cash = result;
            UIkit.modal(this.$refs.cashDialog.$el).show();
        },
        search() {
            this.$refs.searchDialog.show();
        },
        transfer(){
            let sum = this.periodTransactions.filter(tr => tr.transfer && !tr.paid).map(tr => tr.amount).reduce((billy,sam) => billy + sam, 0);
            UIkit.modal.alert(`Transfer ${Currency.format(Math.abs(sum))} ${sum > 0 ? 'from' : 'to'} savings.`);
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
            this.$root.$children[0].$refs.transactionEditor.newTransaction();
        },
        addRecurring() {
            this.$root.$children[0].$refs.recurringEditor.newTransaction();
        },
        logout() {
            this.$store.logout();
        },
        async backup() {
            try {
                await this.$store.backup();
            } catch (err) {
                console.log('ERROR:', err);
                UIkit.notification('ERROR: Unable to download backup', 'danger');
            }

            UIkit.offcanvas(this.$refs.menuNav).hide();
        },
        async restore() {
            try {
                let text = await Upload('.json');
                let data = JSON.parse(text);
                if ('accounts' in data && 'budget' in data.accounts) {
                    // this appears to be budget data
                    UIkit.modal.confirm('Overwrite your budget? Existing entries will be lost.').then(
                        this.$store.restore(data.accounts.budget),
                        function() {
                            // cancel pressed
                        }
                    )
                }
            } catch {
                // don't restore
            }
        },
        spreadsheet() {
            this.getSpreadsheet(`budget-${DateTime.today().toISODate()}.csv`, this.transactions);
        },
        spreadsheetPeriod() {
            this.getSpreadsheet(`budget-${this.period.start.toISODate()}-${this.period.end.toISODate()}.csv`, this.periodTransactions);
        },
        getSpreadsheet(filename, transactions) {
            try {
                let result = [...transactions];
                result.sort((a,b) => {
                    if (a.category == b.category) {
                        if (a.name.localeCompare(b.name) == 0) {
                            return b.amount - a.amount;
                        }
                        return a.name.localeCompare(b.name);
                    }
                    return a.category.localeCompare(b.category);
                });
                let stringData = [
                    'Category,Name,Date,Cash,Transfer,Amount,Paid,Memo',
                    ...result.map(tr => `"${tr.category.replaceAll('"','""')}","${tr.name.replaceAll('"', '""')}","${tr.date.replaceAll('-','/')}",${tr.cash === true},${tr.transfer === true},${tr.amount.toFixed(2)},${tr.paid === true},"${tr.note ? tr.note.replaceAll('\r\n', '').replaceAll('"','""') : ''}"`)
                ].join('\r\n');

                Download(stringData, filename, 'text/csv');


            } catch {
                UIkit.notification('ERROR: Unable to export spreadsheet', 'danger');
            }
            UIkit.offcanvas(this.$refs.menuNav).hide();
        },
        periodSpending() {
            this.$refs.chartDialog.show('Period Spending', this.periodTransactions);
        },
        yearSpending() {
            let startDate = this.period.start.minus({ years: 1 }).toISODate();
            let endDate = this.period.end.toISODate()
            let filtered = this.transactions.filter(tr => startDate <= tr.date && tr.date <= endDate);
            this.$refs.chartDialog.show('Year Spending', filtered);
        },
        reconcile() {
            this.$refs.reconcileDialog.show();
        }
    }
}
</script>