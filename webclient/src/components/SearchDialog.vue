<template>
    <div uk-modal="bg-close: false;" @shown="onShown">
        <div class="uk-modal-dialog">
            <div class="uk-modal-header">
                <h2 class="uk-modal-title">Search</h2>
                <form>
                    <div class="uk-margin">
                        <input class="uk-input" ref="searchTerm" type="text" placeholder="Search..."/>
                        <button class="uk-button uk-button-default" @click.prevent="search">Search</button>
                    </div>
                </form>
            </div>
            <div class="uk-modal-body" uk-overflow-auto>
                <table class="uk-table uk-table-small uk-table-striped uk-table-hover">
                    <thead>
                        <tr><th>Date</th><th>Name</th><th>Amount</th></tr>
                    </thead>
                    <tbody>
                        <tr v-for="transaction in transactions" :key="transaction._key" @click="gotoTransaction(transaction.date)">
                            <td>{{ shortDate(transaction.date) }}</td>
                            <td>{{ transaction.category }}: {{ transaction.name }}</td>
                            <td>{{ currency(transaction.amount) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="uk-modal-footer uk-text-right">
                <button class="uk-button uk-button-default uk-modal-close" type="button">Close</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
    td + td + td {
        text-align: right;
    }
    span.uk-form-icon {
        cursor: pointer !important;
    }
    tbody tr {
        cursor: pointer;
    }
</style>

<script>
import { Currency, ShortDate } from '../util/formats';
import { CalculatePeriod } from "../util/date";
import { DateTime } from 'luxon';
import UIkit from 'uikit';

export default {
    data: function() {
        return { 
            transactions: []
         };
    },
    computed: {
        period: {
            get: function() { return this.$store.state.period; },
            set: function(val) { 
                this.$store.commit('set', { key: 'period', value: val });
            }
        }
    },
    methods: {
        currency(val) { return Currency.format(val); },
        shortDate(val) { return ShortDate.format(val); },
        search() {
            if (this.$refs.searchTerm.value) {
                this.transactions = this.$store.findText(this.$refs.searchTerm.value);
            } else {
                this.transactions = [];
            }
        },
        gotoTransaction(date) { 
            date = DateTime.fromISO(date).startOf('day')
            let period = CalculatePeriod(date, 
                this.$store.state.config.startDate, 
                this.$store.state.config.periodLength);
            this.period = period;
            UIkit.modal(this.$el).hide();
        },
        show() {
            this.transactions = [];
            this.$refs.searchTerm.value = '';
            UIkit.modal(this.$el).show();
        },
        onShown() {
            this.$refs.searchTerm.focus();
        }
    }
}
</script>
