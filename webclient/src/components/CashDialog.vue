<template>
    <div uk-modal="bg-close: false;">
        <div class="uk-modal-dialog">
            <div class="uk-modal-header">
                <h2 class="uk-modal-title">Cash Withdrawal</h2>
            </div>
            <div class="uk-modal-body" uk-overflow-auto>
                <table class="uk-table uk-table-small">
                    <thead>
                        <tr><th>Denomination</th><th>Quantity</th><th>Total</th></tr>
                    </thead>
                    <tbody>
                        <tr v-if="hundreds > 0">
                            <td>$100</td>
                            <td>{{ hundreds }}</td>
                            <td>{{ currency(100.0 * hundreds )}}</td>
                        </tr>
                        <tr v-if="fifties > 0">
                            <td>$50</td>
                            <td>{{ fifties }}</td>
                            <td>{{ currency(50.0 * fifties )}}</td>
                        </tr>
                        <tr v-if="twenties > 0">
                            <td>$20</td>
                            <td>{{ twenties }}</td>
                            <td>{{ currency(20.0 * twenties )}}</td>
                        </tr>
                        <tr v-if="tens > 0">
                            <td>$10</td>
                            <td>{{ tens }}</td>
                            <td>{{ currency(10.0 * tens )}}</td>
                        </tr>
                        <tr v-if="fives > 0">
                            <td>$5</td>
                            <td>{{ fives }}</td>
                            <td>{{ currency(5.0 * fives )}}</td>
                        </tr>
                        <tr v-if="ones > 0">
                            <td>$1</td>
                            <td>{{ ones }}</td>
                            <td>{{ currency(1.0 * ones )}}</td>
                        </tr>
                        <tr v-if="quarters > 0">
                            <td>25&cent;</td>
                            <td>{{ quarters }}</td>
                            <td>{{ currency(0.25 * quarters )}}</td>
                        </tr>
                        <tr v-if="dimes > 0">
                            <td>10&cent;</td>
                            <td>{{ dimes }}</td>
                            <td>{{ currency(0.1 * dimes )}}</td>
                        </tr>
                        <tr v-if="nickels > 0">
                            <td>5&cent;</td>
                            <td>{{ nickels }}</td>
                            <td>{{ currency(0.05 * nickels )}}</td>
                        </tr>
                        <tr v-if="pennies > 0">
                            <td>1&cent;</td>
                            <td>{{ pennies }}</td>
                            <td>{{ currency(0.01 * pennies )}}</td>
                        </tr>
                    </tbody>
                    <tfoot><tr><td colspan="3">TOTAL: {{ currency(total) }}</td></tr></tfoot>
                </table>
            </div>
            <div class="uk-modal-footer uk-text-right">
                <button class="uk-button uk-button-default uk-modal-close" type="button">OK</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
    td + td {
        text-align: center;
    }
    td + td + td {
        text-align: right;
    }
    tfoot td {
        text-align: right;
        font-weight: bold;
    }
</style>

<script>
import { Currency } from '../util/formats';

export default {
    data: function() {
        return { cashData: { total: 0 } };
    },
    computed: {
        cash: {
            get: function() { return this.cashData; },
            set: function(val) { this.cashData = val; }
        },
        hundreds() {
            return this.cash['100.00'];
        },
        fifties() {
            return this.cash['50.00'];
        },
        twenties() {
            return this.cash['20.00'];
        },
        tens() {
            return this.cash['10.00'];
        },
        fives() {
            return this.cash['5.00'];
        },
        ones() {
            return this.cash['1.00'];
        },
        quarters() {
            return this.cash['0.25'];
        },
        dimes() {
            return this.cash['0.10'];
        },
        nickels() {
            return this.cash['0.05'];
        },
        pennies() {
            return this.cash['0.01'];
        },
        total() {
            return this.cash.total;
        }
    },
    methods: {
        currency(val) { return Currency.format(val); }
    }
}
</script>
