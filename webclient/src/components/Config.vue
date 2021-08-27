<template>
    <div  uk-modal="bg-close: false">
        <div class="uk-modal-dialog">
            <div class="uk-modal-header">
                <h2 class="uk-modal-title">Config</h2>
            </div>

            <div class="uk-modal-body" uk-overflow-auto>
                <form class="uk-form-stacked" @keypress.enter="save">

                    <div class="uk-margin">
                        <label class="uk-form-label" for="ce-dialog-periodlength">Period Length</label>
                        <div class="uk-form-controls">
                            <input v-model="configuration.periods.length" class="uk-input" id="ce-dialog-periodlength" type="text" placeholder="Some text...">
                        </div>
                    </div>
                
                    <div class="uk-margin">
                        <label class="uk-form-label" for="ce-dialog-start">Start Date</label>
                        <div class="uk-form-controls">
                            <input v-model="configuration.periods.start" class="uk-input" id="ce-dialog-start" type="date" placeholder="Some text...">
                        </div>
                    </div>

                    <div class="uk-margin">
                        <label class="uk-form-label" for="ce-dialog-theme">theme</label>
                        <div class="uk-form-controls">
                            <select v-model="configuration.theme" class="uk-select" id="ce-dialog-theme">
                                <option value="default">Default</option>
                                <option value="brown">Brown</option>
                                <option value="purple">Purple</option>
                            </select>
                        </div>
                    </div>
                </form>                
            </div>
            <div class="uk-modal-footer uk-text-right">
                <button class="uk-button uk-button-default uk-modal-close" type="button">Cancel</button>
                <button @click="save" class="uk-button uk-button-primary" type="button" >Save</button>
            </div>
            

        </div>
    </div>      
</template>

<script>

import UIkit from 'uikit';
import Firebase from '../data/firebase';
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default {
    computed:{
        ...Vuex.mapState(['configuration'])
    },
    methods:{
        save(){
            Firebase.saveConfig(this.configuration);
            UIkit.modal(this.$el).hide();
        },
        show(){
            UIkit.modal(this.$el).show();
        }
    }
}
</script>