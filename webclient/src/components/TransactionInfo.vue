<template>
    <div class="uk-container uk-width-1-3@m uk-visible@m" uk-height-viewport="expand: true" id="info-div">
        <h4 v-if="transaction">{{ transaction.name }}</h4>
        <div v-if="transaction">Total: {{ currency(total) }}</div>
        <div v-if="transaction">Paid: {{ currency(paid) }}</div>
        <table v-if="transaction" class="uk-table uk-table-small uk-table-striped uk-table-hover">
            <thead>
                <tr><th>Date</th><th>Amount</th></tr>
            </thead>
            <tbody>
                <tr v-for="tr in transactions" :key="tr._key" @click="gotoTransaction(tr.date)">
                    <td>{{ date(tr.date) }}</td>
                    <td>{{ currency(tr.amount)}}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { Currency } from "../util/formats";
import { CalculatePeriod } from "../util/date";
import { DateTime } from 'luxon';

export default {
    props: ['transaction'],
    computed: {
        transactions() {
            if (this.transaction) { 
                return this.$store.findTransactions({
                    category: this.transaction.category,
                    name: this.transaction.name
                }).sort((a, b) => a.date.localeCompare(b.date));
            }
            return [];
        },
        total() {
            return this.transactions.map(tr => tr.amount).reduce((a,b) => a + b, 0);
        },
        paid() {
            return this.transactions.filter(tr => tr.paid).map(tr => tr.amount).reduce((a,b) => a + b, 0);
        },
        period: {
            get: function() { return this.$store.state.period; },
            set: function(val) { 
                this.$store.commit('set', { key: 'period', value: val });
            }
        },
    },
    methods: {
        currency(val) { return Currency.format(val); },
        date(val) { 
            return DateTime.fromISO(val).startOf('day')
                .toLocaleString({ month: 'short', day: 'numeric', year: 'numeric' }); 
        },
        gotoTransaction(date) { 
            date = DateTime.fromISO(date).startOf('day')
            let period = CalculatePeriod(date, 
                this.$store.state.config.startDate, 
                this.$store.state.config.periodLength);
            console.log(date.toString(), period);
            this.period = period;
        },
    }
}
</script>

<style scoped>
    td {
        cursor: pointer;
    }
</style>