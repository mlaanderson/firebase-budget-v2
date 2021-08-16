<template>
    <div class="uk-section uk-overflow-auto" uk-height-viewport="expand: true" id="viewport">
        <div class="uk-container">
            <div>
                <transaction-detail v-for="transaction in periodTransactions" :key="transaction.key" :transaction="transaction"/>
                <!-- <div v-for="transaction in periodTransactions" :key="transaction._key">
                    {{ transaction.date }}
                    {{ transaction.name }}
                    {{ currency(transaction.amount) }}
                    {{ transaction.paid ? "" : "NOT PAID" }}
                </div> -->
            </div>
        </div>
    </div>
</template>

<script>
import Vue from 'vue';
import Vuex from 'vuex';
import TransactionDetail from './TransactionDetail.vue';
import { Currency } from '../util/formats';

Vue.use(Vuex);

export default {
    components: {
        TransactionDetail
    },
    methods: {
        currency(value) { return Currency.format(value); }
    },
    computed: {
        ...Vuex.mapGetters(['periodTransactions']),
        ...Vuex.mapState(['config'])
    },
}
</script>