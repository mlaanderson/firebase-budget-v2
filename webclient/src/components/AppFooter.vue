<template>
    <span>
        <strip-chart class="uk-section uk-section-primary bdg-chart"/>
    </span>
</template>

<style scoped>
    .bdg-chart {
        padding-bottom: 5px !important;
        padding-top: 5px !important;
    }
</style>

<script>
import Vue from 'vue';
import Vuex from 'vuex';
import { Currency } from '../util/formats';
import StripChart from './StripChart.vue';

Vue.use(Vuex);

export default {
    components: {
        StripChart
    },
    computed: {
        ...Vuex.mapGetters(['dailyBalances', 'budgetBalance', 'bankBalance']),
    },
    methods: {
        currency(val) { return Currency.format(val); } 
    }
}
</script>