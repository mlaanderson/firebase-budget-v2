<template>
    <div ref="chart"></div>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import { Chart, registerables } from 'chart.js';

Vue.use(Vuex);
Chart.register(...registerables);

export default {
    computed: {
        ...Vuex.mapGetters(['dailyBalances']),
        // labels() {
        //     return this.dailyBalances.map(r => r.date);
        // },
        // values() {
        //     return this.dailyBalances.map(r => r.amount);
        // },
        // data() {
        //     return {
        //         labels: this.labels,
        //         datasets: [
        //             {
        //                 label: 'Dataset',
        //                 data: this.values
        //             }
        //         ]
        //     }
        // }
    },
    data: () => {
        return {
            chartdata: {
                labels: ['January', 'February'],
                datasets: [
                    {
                    label: 'Data One',
                    backgroundColor: '#f87979',
                    data: [40, 20]
                    }
                ]
            },
            options: {
            responsive: true,
            maintainAspectRatio: false
            },
        };
    },
    mounted() {
        console.log('mounted');
    }
}
</script>