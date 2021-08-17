<template>
    <div class="uk-section uk-overflow-auto" uk-grid @touchmove="onTouch" @touchend="onTouchEnd">
        <div class="uk-container uk-width-2-3@m" uk-height-viewport="expand: true" id="viewport">
            <div>
                <transaction-detail v-for="transaction in periodTransactions" 
                    :key="transaction.key" :transaction="transaction" @info="info"/>
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
import { CalculatePeriod } from '../util/date';

Vue.use(Vuex);

var lastTouch = null;

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
        },
        onTouch(evt) {
            if (lastTouch !== null) {
                let deltaX = lastTouch.clientX - evt.touches[0].clientX;
                if (Math.abs(deltaX) > this.$el.offsetWidth / 2) {
                    if (deltaX > 0) { // increase by 1 period
                        let period = CalculatePeriod(this.$store.state.period.end.plus({days: 1}), 
                            this.$store.state.config.startDate, this.$store.state.config.periodLength);
                        this.$store.commit('set', { key: 'period', value: period });
                    } else { // decrease by 1 period
                        let period = CalculatePeriod(this.$store.state.period.start.minus({days: 1}), 
                            this.$store.state.config.startDate, this.$store.state.config.periodLength);
                        this.$store.commit('set', { key: 'period', value: period });
                    }
                    // ensure we don't keep swiping
                    lastTouch = null;
                }
            } else {
                lastTouch = evt.touches[0];
            }
        },
        onTouchEnd() {
            lastTouch = null;
        },
    },
    computed: {
        ...Vuex.mapGetters(['periodTransactions']),
        ...Vuex.mapState(['config'])
    },
}
</script>