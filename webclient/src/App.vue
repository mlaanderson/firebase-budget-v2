<template>
    <div id="app">
        <top-nav-bar/>   
        <transaction-list/>
        <app-footer/>

        <!-- dialogs -->
        <login-dialog ref="loginDialog"/>
    </div>
</template>

<script>
import Vue from 'vue';
import Vuex from 'vuex';
import store from './data/store';
import UIkit from 'uikit';
import TopNavBar from './components/TopNavBar.vue';
import LoginDialog from './components/LoginDialog.vue';
import AppFooter from './components/AppFooter.vue';
import TransactionList from './components/TransactionList.vue';

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
        LoginDialog, TopNavBar, AppFooter, TransactionList
    },
    store,
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
    }
}
</script>

<style>
    @import url(https://cdn.jsdelivr.net/npm/uikit@3.7.2/dist/css/uikit.min.css);
</style>
