<template>
    <div class="uk-card uk-card-body uk-width-1-1">
        <div v-show="transaction.cash || transaction.check || transaction.paid || transaction.scheduled || transaction.recurring || transaction.note || transaction.transfer" class="uk-card-badge uk-label">
            <span v-show="transaction.paid" uk-icon="icon: check" uk-tooltip="Paid"></span>
            <span v-show="!transaction.paid && transaction.scheduled" uk-icon="icon: calendar" uk-tooltip="Scheduled"></span>
            <span v-show="transaction.recurring" uk-icon="icon: future" uk-tooltip="Recurring Transaction"></span>
            <span v-show="transaction.note" uk-icon="icon: comment" :uk-tooltip="transaction.note"></span>
            <span v-show="transaction.check" uk-icon="icon: credit-card" :uk-tooltip="`Check ${transaction.check}`"></span>
            <span v-show="transaction.cash" uk-icon="icon: fa-regular-money-bill-alt" uk-tooltip="Cash"></span>
            <span v-show="transaction.transfer" uk-icon="icon: arrow-right" uk-tooltip="Transfer"></span>
        </div>
        <ul class="uk-iconnav">
            <li>
                <a href="#" v-on:click.prevent="editTransaction" uk-icon="icon: file-edit" uk-tooltip="Edit"></a>
            </li>
            <li v-show="transaction.recurring">
                <a href="#" @click.prevent="editRecurring" uk-icon="icon: future" uk-tooltip="Edit Recurring"></a>
            </li>
            <li>
                <a href="#" v-on:click.prevent="copyTransaction" uk-icon="icon: copy" uk-tooltip="Copy Transaction"></a>
            </li>
            <li>
                <a href="#" v-on:click.prevent="deleteTransaction" uk-icon="icon: trash" uk-tooltip="Delete"></a>
            </li>
            <li class="uk-visible@m">
                <a href="#" v-on:click.prevent="showInfo" uk-icon="icon: info" uk-tooltip="Details"></a>
            </li>
        </ul>
        <h3 class="uk-card-title">{{transaction.category}}: {{transaction.name}}</h3>
        <div class="uk-child-1-1 uk-grid">
            <div class="uk-width-expand" uk-leader>{{ date(transaction.date) }}</div>
            <div>{{ currency(transaction.amount) }}</div>
        </div>
    </div>
</template>

<style scoped>
    .uk-iconnav {
        position: absolute;
        top: 15px;
        left: 15px;
    }
    .uk-card-title {
        margin-top: 12px;
    }
    .uk-card {
        border-bottom: 1px solid #e5e5e5;
    }
</style>

<script>
import Vue from 'vue';
import Vuex from 'vuex';
import UIkit from 'uikit';
import { Currency, ShortDate } from '../util/formats';

Vue.use(Vuex);

export default {
    props: ['transaction'],
    methods: {
        currency(value) { return Currency.format(value); },
        date(value) { return ShortDate.format(value); },
        editTransaction() { 
            this.$root.$children[0].$refs.transactionEditor.transaction = JSON.parse(JSON.stringify(this.transaction));
            this.$root.$children[0].$refs.transactionEditor.show();
        },
        editRecurring() {
            if (this.transaction.recurring) {
                let transaction = this.recurring.filter(tr => tr._key === this.transaction.recurring)[0];
                // clone the transaction so changes don't happen until a save
                this.$root.$children[0].$refs.recurringEditor.transaction = JSON.parse(JSON.stringify(transaction));
                this.$root.$children[0].$refs.recurringEditor.show();
            }
        },
        async deleteTransaction() {
            try {
                await UIkit.modal.confirm(`Delete ${this.transaction.name} in ${this.transaction.category}?`)
                await this.$store.deleteTransaction(this.transaction);
            } catch {
                // nothing to do 
            }
        },
        async copyTransaction() {
            let copy = JSON.parse(JSON.stringify(this.transaction));
            delete copy._key;
            copy.paid = false;
            copy.scheduled = false;
            copy.recurring = null;
            await this.$store.saveTransaction(copy);
        },
        showInfo() {
            this.$emit('info', this.transaction);
        },
    },
    computed: {
        ...Vuex.mapState(['config', 'recurring'])
    },
}
</script>