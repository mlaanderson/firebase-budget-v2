<template>
    <div id="app">
        <top-nav-bar/>   
        <transaction-list/>
        <app-footer/>

        <!-- datalists -->
        <datalist id="transaction-names">
            <option v-for="name in transactionNames" :key="name" :value="name"/>
        </datalist>

        <!-- dialogs -->
        <login-dialog ref="loginDialog"/>
        <transaction-editor ref="transactionEditor"/>
        <recurring-editor ref="recurringEditor"/>
    </div>
</template>

<script>
import Vue from 'vue';
import Vuex from 'vuex';
import store from './data/store';
import UIkit from 'uikit';
import TopNavBar from './components/TopNavBar.vue';
import LoginDialog from './components/LoginDialog.vue';
import TransactionEditor from './components/TransactionEditor.vue';
import RecurringEditor from './components/RecurringEditor.vue';
import AppFooter from './components/AppFooter.vue';
import TransactionList from './components/TransactionList.vue';

if (window.localStorage && window.localStorage.getItem('theme')) {
    import(`./assets/css/uikit.${window.localStorage.getItem('theme')}-theme.min.css`);
} else {
    import('./assets/css/uikit.default-theme.min.css');
}
Vue.use(Vuex);

// This mixin makes uikit available in all components
Vue.mixin({
    data: function() {
        return {
            get UIkit() {
                return UIkit;
            }
        }
    }
});

export default {
    name: 'App',
    components: {
        LoginDialog, TopNavBar, AppFooter, TransactionList, TransactionEditor, RecurringEditor
    },
    store,
    computed: {
        ...Vuex.mapState(['theme']),
        ...Vuex.mapGetters(['transactionNames'])
    },
    beforeCreate() {
        document.title = 'Anderson Budget';
    },
    mounted() {
        // add a mutation observer to viewport to adjust the max-height 
        // style whenever the min-height changes. UIkit handles the
        // min-height adjustment already
        function adjustViewport() {
            let el = document.getElementById('viewport');
            if (el && (el.style.minHeight !== el.style.maxHeight)) {
                el.style.maxHeight = el.style.minHeight;
                el.style.overflowY = 'scroll';
            }
            el = document.getElementById('info-div');
            if (el && (el.style.minHeight !== el.style.maxHeight)) {
                el.style.maxHeight = el.style.minHeight;
                el.style.overflowY = 'scroll';
            }
        }

        const viewportObserver = new MutationObserver(adjustViewport);
        viewportObserver.observe(document.getElementById('viewport'), {
            attributes: true,
            attributeFilter: ['style']
        });

        // manually adjust the viewport height on-load
        adjustViewport();
    },
    watch: {
        theme(value) {
            if (window.localStorage) {
                window.localStorage.setItem('theme', value);
            }
            import(`./assets/css/uikit.${value}-theme.min.css`);
        }
    }
}
</script>
