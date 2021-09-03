<template>
    <div class="uk-modal-full" uk-modal>
        <div class="uk-modal-dialog">
            <button class="uk-modal-close-full uk-close-large" type="button" uk-close></button>
            <div class="uk-modal-header">
                <h2 class="uk-modal-title">Reconcile:  {{ shortDate(period.start) }} to {{ shortDate(period.end) }}</h2>
                <p>Budget: {{ currency(balance) }} Bank: {{ currency(bankBalance) }}</p>
                <div class="uk-navbar-container uk-navbar-transparent uk-section-default uk-padding-small" uk-navbar>
                    <div class="uk-navbar-left">
                        <ul class="uk-iconnav">
                            <li><a href="#" @click.prevent="reconcile" uk-icon="icon: check" uk-tooltip="Confirm Reconciliation"></a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="uk-modal-body">
                <div uk-grid>
                    <div class="uk-width-1-2" uk-overflow-auto>
                        <a id="budTop" ref="budTop"/>
                        <div class="uk-width-1-1">
                            <div v-if="autoReconciled.length > 0">
                                <h4>Matches</h4>
                                <div v-for="tr in autoReconciled" :key="tr.budget._key" class="uk-card uk-card-default uk-card-body">
                                    {{tr.budget.category}}: {{tr.budget.name}} {{currency(tr.budget.amount)}}
                                    <div uk-sortable="group: sortable-group" :ref="tr.budget._key" :id="tr.budget._key" onadded="console.log('added')">
                                        <div class="uk-card uk-card-primary uk-card-body uk-card-small" :id="tr.bank.id">
                                            {{shortDate(tr.bank.posted)}} {{tr.bank.name}} {{currency(tr.bank.amount)}}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-if="closeMatches.length > 0">
                                <h4>Close Matches</h4>
                                <div v-for="tr in closeMatches" :key="tr.budget._key" class="uk-card uk-card-default uk-card-body">
                                    {{tr.budget.category}}: {{tr.budget.name}} {{currency(tr.budget.amount)}}
                                    <div uk-sortable="group: sortable-group" :ref="tr.budget._key" :id="tr.budget._key">
                                        <div class="uk-card uk-card-primary uk-card-body uk-card-small" :id="tr.bank.id">
                                            {{shortDate(tr.bank.posted)}} {{tr.bank.name}} {{currency(tr.bank.amount)}}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-if="budgetUnreconciled.length > 0">
                                <h4>Unreconciled</h4>
                                <div v-for="tr in budgetUnreconciled" :key="tr._key" class="uk-card uk-card-default uk-card-body">
                                    {{tr.category}}: {{tr.name}} {{currency(tr.amount)}}
                                    <div uk-sortable="group: sortable-group" :ref="tr._key" :id="tr._key"> </div>
                                </div>
                            </div>
                            <div>
                                <h4>New</h4>
                                <div class="uk-card uk-card-default uk-card-body">
                                    <div uk-sortable="group: sortable-group" ref="added"> </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="uk-width-1-2" uk-overflow-auto>
                        <a id="bankTop" ref="bankTop"/>
                        <h4>Bank Transactions</h4>
                        <div uk-sortable="group: sortable-group" style="height: 100%;" ref="bank">
                            <div class="uk-margin" v-for="tr in bankUnreconciled" :key="tr.id" :id="tr.id">
                                <div class="uk-card uk-card-primary uk-card-body uk-card-small">
                                    {{shortDate(tr.posted)}} {{tr.name}} {{currency(tr.amount)}}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .uk-modal-full, .uk-modal-dialog {
        height: 100vh !important;
        overflow-y: clip !important;
    }
    .uk-modal-body, .uk-grid {
        height: calc(100vh - 210px);
    }
</style>

<script>
import Vue from 'vue';
import Vuex from 'vuex';
import UIkit from 'uikit';
import { Upload, ParseOfx } from '../util/file';
import { Currency, ShortDate } from '../util/formats';
import levenshtein from 'js-levenshtein';

window.UIkit = UIkit;

Vue.use(Vuex);

export default {
    data: function() {
        return {
            bankRecords: [],
            autoReconciled: [],
            closeMatches: [],
            bankUnreconciled: [],
            budgetUnreconciled: [],
            shadowTransactions: [],
            balance: 0,
            bankBalance: 0
        }
    },
    computed: {
        ...Vuex.mapGetters(['periodTransactions']),
        ...Vuex.mapState(['transactions', 'period'])
    },
    methods: {
        show() {
            UIkit.modal(this.$el).show();
            this.uploadQFX();
        },
        reconcile() {
            let changes = [ ...this.autoReconciled.map(t => t.budget), ...this.closeMatches.map(t => t.budget), ...this.budgetUnreconciled];
            changes.map(tr => {
                this.$store.saveTransaction(tr);
            });
            UIkit.modal(this.$el).hide();
        },
        async uploadQFX() {
            try {
                let imported = await Upload('.qif,.qfx,.ofx');
                this.bankRecords = ParseOfx(imported);
                this.autoReconciled = [];
                this.closeMatches = [];
                this.bankUnreconciled = [];
                this.shadowTransactions = JSON.parse(JSON.stringify(this.transactions));

                let bankPeriod = this.bankRecords.transactions.filter(t => this.period.start <= t.posted); 
                let perTransactions = this.shadowTransactions.filter(tr => this.period.start.toISODate() <= tr.date && tr.date <= this.period.end.toISODate());
                let removes = [];

                // find the available balance
                this.bankBalance = this.bankRecords.ledgerBalance.amount - this.bankRecords.transactions.filter(t => this.period.end < t.posted)
                    .map(t => t.amount).reduce((a,b) => a + b, 0);

                // start by marking all transactions in this period as unpaid
                perTransactions.map(tr => { tr.paid = false; });

                // auto reconciled: same amount, within the period
                for (let tr of bankPeriod) {
                    let matches = perTransactions.filter(t => t.amount == tr.amount);
                    if (matches.length > 0) {
                        matches.sort((a,b) => levenshtein(a.name, b.name));
                        this.autoReconciled.push({
                            budget: matches[0],
                            bank: tr
                        });
                        perTransactions = perTransactions.filter(t => t !== matches[0]);
                        removes.push(tr);
                        // mark this as paid
                        matches[0].paid = true;
                    }
                }
                bankPeriod = bankPeriod.filter(tr => removes.indexOf(tr) < 0);
                removes = [];

                // close matches: same amount, within 4 days of the period, not already auto reconciled
                perTransactions = this.shadowTransactions.filter(tr => 
                    this.period.start.minus({days:4}).toISODate() <= tr.date && 
                    tr.date <= this.period.end.plus({days:4}) &&
                    !this.autoReconciled.find(ar => ar.budget._key === tr._key));
                for (let tr of bankPeriod) {
                    let matches = perTransactions.filter(t => t.amount == tr.amount);
                    if (matches.length > 0) {
                        matches.sort((a,b) => levenshtein(a.name, b.name));
                        this.closeMatches.push({
                            budget: matches[0],
                            bank: tr
                        });
                        perTransactions = perTransactions.filter(t => t !== matches[0]);
                        removes.push(tr);
                        // mark this as paid
                        matches[0].paid = true;
                    }
                }
                this.bankUnreconciled = bankPeriod.filter(tr => removes.indexOf(tr) < 0);
                this.budgetUnreconciled = this.shadowTransactions.filter(tr => 
                    this.period.start.toISODate() <= tr.date &&
                    tr.date <= this.period.end.toISODate() &&
                    !this.autoReconciled.find(ar => ar.budget._key === tr._key) &&
                    !this.closeMatches.find(ar => ar.budget._key === tr._key)
                );

                this.updateBalance();

                // scroll to top
                UIkit.scroll(this.$refs.budTop).scrollTo(this.$refs.budTop);
                UIkit.scroll(this.$refs.bankTop).scrollTo(this.$refs.bankTop);
            } catch (err) {
                // cancel selected on file upload
                console.log(err);
            }
        },
        updateBalance() {
                let end = this.period.end.toISODate();
                this.balance = this.shadowTransactions.filter(tr => (tr.date <= end) && tr.paid)
                    .map(tr => tr.amount)
                    .reduce((a,b) => a + b, 0);
        },
        currency(value) {
            return Currency.format(value);
        },
        shortDate(value) {
            return ShortDate.format(value);
        }
    },
    updated() {
        // console.log(this.$refs)
        for (let ch in this.$refs) {
            if (ch !== 'bank') {
                UIkit.util.on(this.$refs[ch][0], 'added', (e) => {
                    let container = e.detail[0]; // this appears to be a vuejs instance
                    let bank = e.detail[1]; // this is the HTML div that was dragged in
                    let bankTr = this.bankRecords.transactions.filter(t => t.id == bank.id);
                    
                    // remove any previously matched transactions
                    for (let el of container.$el.children) {
                        if (el !== bank) {
                            this.$refs.bank.append(el);
                        }
                    }
                    // mark the transaction as paid in the shadow
                    this.shadowTransactions.filter(tr => tr._key === container.$el.id).map(tr => {
                        tr.paid = true;
                        if (bankTr.length === 1) {
                            tr.amount = bankTr[0].amount;
                        }
                    });
                    this.bankUnreconciled.filter(tr => tr._key === container.$el.id).map(tr => {
                        tr.paid = true;
                        if (bankTr.length === 1) {
                            tr.amount = bankTr[0].amount;
                        }
                    });
                    this.closeMatches.filter(tr => tr.budget._key === container.$el.id).map(tr => {
                        tr.budget.paid = true;
                        if (bankTr.length === 1) {
                            tr.budget.amount = bankTr[0].amount;
                        }
                    });
                    this.autoReconciled.filter(tr => tr.budget._key === container.$el.id).map(tr => {
                        tr.budget.paid = true;
                        if (bankTr.length === 1) {
                            tr.budget.amount = bankTr[0].amount;
                        }
                    });
                    this.updateBalance();
                });
                UIkit.util.on(this.$refs[ch][0], 'removed', (e) => {
                    let container = e.detail[0]; // this is the vuejs instance where the div was removed from
                    // mark the transaction as not paid in the shadow
                    this.shadowTransactions.filter(tr => tr._key === container.$el.id).map(tr => { tr.paid = false; });
                    this.updateBalance();
                });
            }
        }
    }
}
</script>