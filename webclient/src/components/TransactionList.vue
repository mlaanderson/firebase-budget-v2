<template>
    <div class="uk-section uk-overflow-auto" uk-height-viewport="expand: true" id="viewport" uk-grid>
        <div class="uk-container uk-width-2-3@m">
            <div>
                <transaction-detail v-for="transaction in periodTransactions" :key="transaction.key" :transaction="transaction" @info="info"/>
                <!-- <div v-for="transaction in periodTransactions" :key="transaction._key">
                    {{ transaction.date }}
                    {{ transaction.name }}
                    {{ currency(transaction.amount) }}
                    {{ transaction.paid ? "" : "NOT PAID" }}
                </div> -->
            </div>
        </div>
        <transaction-info :transaction="selected"/>
    </div>
</template>

<script>
import Vue from 'vue';
import Vuex from 'vuex';
import TransactionDetail from './TransactionDetail.vue';
import TransactionInfo from './TransactionInfo.vue';
import { Currency } from '../util/formats';

Vue.use(Vuex);

export default {
    components: {
        TransactionDetail, TransactionInfo
    },
    data: function () {
        return {
            selected: null
        }
    },
    methods: {
        currency(value) { return Currency.format(value); },
        info(transaction) {
            this.selected = transaction;
        }
    },
    computed: {
        ...Vuex.mapGetters(['periodTransactions']),
        ...Vuex.mapState(['config'])
    },
}
</script>