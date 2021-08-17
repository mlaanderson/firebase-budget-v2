<template>
    <div class="uk-section uk-section-primary uk-height-max-small">
        <div class="uk-container">
            <div class="uk-text-right">Balance: {{ currency(budgetBalance) }}</div>
            <div class="uk-text-right">Bank: {{ currency(bankBalance) }}</div>
        </div>
        <chart-component/>
    </div>  
</template>

<script>
import Vue from 'vue';
import Vuex from 'vuex';
import ChartComponent from './ChartComponent.vue';
import { Currency } from '../util/formats';

Vue.use(Vuex);

export default {
    components: {
        ChartComponent
    },
    computed: {
        ...Vuex.mapGetters(['dailyBalances', 'budgetBalance', 'bankBalance']),
    },
    methods: {
        currency(val) { return Currency.format(val); } 
    }
}
</script>