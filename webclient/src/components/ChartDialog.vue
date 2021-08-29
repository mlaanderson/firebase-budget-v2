<template>
    <div uk-modal="bg-close: false">
        <div class="uk-modal-dialog">
            <div class="uk-modal-header">
                <h2 class="uk-modal-title">{{ title }}</h2>
            </div>

            <div class="uk-modal-body" uk-overflow-auto>
                <table class="uk-table uk-table-small">
                    <thead><th>Category</th><th>Spending</th><th>Pct.</th></thead>
                    <tbody>
                        <tr v-for="cat in categories" :key="cat">
                            <td :style="`background: linear-gradient(to right, #D0D0D0 ${(100 * spending[cat] / total).toFixed(0)}%, rgba(0,0,0,0) ${(100 * spending[cat] / total).toFixed(0)}%);`">{{ cat }}</td>
                            <td>{{ currency(spending[cat]) }}</td>
                            <td>{{ (100 * spending[cat] / total).toFixed(0) }}%</td>
                        </tr>
                    </tbody>
                    <tfoot><th>TOTAL</th><th>{{ currency(total) }}</th><th/></tfoot>
                </table>                
            </div>

            <div class="uk-modal-footer uk-text-right">
                <button class="uk-button uk-button-default uk-modal-close" type="button">Close</button>
            </div>

        </div>
    </div>      
</template>

<style scoped>
    td+td, th+th {
        text-align: right;
    }
</style>

<script>
import UIkit from 'uikit';
import Vue from 'vue';
import Vuex from 'vuex';
import { Currency } from '../util/formats';

Vue.use(Vuex);

export default {
    data: function() {
        return {
            title: 'Spending',
            spending: {},
            total: 0
        }
    },
    computed: {
        ...Vuex.mapState(['config']),
        categories() {
            return this.config.categories.filter(c => c in this.spending)
        }
    },
    methods: {
        show(title, transactions) {
            this.title = title;
            this.spending = {};
            this.total = 0;

            for (let tr of transactions) {
                if (tr.category == 'Income') continue;
                if (tr.category in this.spending === false) {
                    this.spending[tr.category] = -tr.amount;
                } else {
                    this.spending[tr.category] -= tr.amount;
                }
                this.total -= tr.amount;
            }

            UIkit.modal(this.$el).show();
        },
        currency(value) {
            return Currency.format(value);
        }
    }
}
</script>