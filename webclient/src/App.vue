<template>
    <div id="app">
        <button class="uk-button uk-button-default" v-on:click="increment">Clicked {{ count }} times</button>
    </div>
</template>

<script>
import Vue from 'vue';
import Vuex from 'vuex';
import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
import Firebase from './data/firebase';

Vue.use(Vuex);
UIkit.use(Icons);

window.firebase = Firebase;

// This will be the firebase store...move to another module?
const store = new Vuex.Store({
    state: {
        count: 0,
        transactions: null,
        config: null,
        recurring: null
    },
    mutations: {
        increment: state => state.count++,
        decrement: state => state.count--
    }
});

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
    store,
    methods: {
        increment() {
            this.$store.commit('increment');
            console.log(this.$store.state.count);
        }
    },
    computed: {
        count() {
            return store.state.count;
        }
    }
}
</script>

<style>
    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }

    @import url(https://cdn.jsdelivr.net/npm/uikit@3.7.2/dist/css/uikit.min.css);
</style>
