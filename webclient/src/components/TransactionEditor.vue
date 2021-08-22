<template>
    <div id="edit-record-dialog" uk-modal="bg-close: false">
        <div class="uk-modal-dialog">
            <div class="uk-modal-header">
                <h2 class="uk-modal-title">{{ mode }} Transaction</h2>
            </div>

            <div class="uk-modal-body" uk-overflow-auto>
                <form class="uk-form-stacked">

                    <div class="uk-margin">
                        <label class="uk-form-label" for="edit-record-dialog-date">Date</label>
                        <div class="uk-form-controls">
                            <input v-model="date" class="uk-input" id="edit-record-dialog-date" type="date" placeholder="Some text...">
                        </div>
                    </div>
                
                    <div class="uk-margin">
                        <label class="uk-form-label" for="edit-record-dialog-category">Category</label>
                        <div class="uk-form-controls">
                            <select v-model="category" class="uk-select" id="edit-record-dialog-category">
                                <option v-for="category in config.categories" :key="category">{{ category }}</option>
                            </select>
                        </div>
                    </div>

                    <div class="uk-margin">
                        <label class="uk-form-label" for="edit-record-dialog-name">Name</label>
                        <div class="uk-form-controls">
                            <input v-model="name" class="uk-input" id="edit-record-dialog-name" type="text" placeholder="Name...">
                        </div>
                    </div>

                    <div class="uk-margin">
                        <div class="uk-form-controls">
                            <label><input v-model="deposit" class="uk-checkbox" type="checkbox" id="edit-record-dialog-deposit"> Deposit</label><br>
                            <label><input v-model="cash" class="uk-checkbox" type="checkbox" id="edit-record-dialog-cash"> Cash</label><br>
                            <label><input v-model="transfer" class="uk-checkbox" type="checkbox" id="edit-record-dialog-transfer"> Transfer</label><br>
                        </div>
                    </div>

                    <div class="uk-margin">
                        <label class="uk-form-label" for="edit-record-dialog-check">Check Number</label>
                        <div class="uk-form-controls">
                            <input v-model="check" class="uk-input" id="edit-record-dialog-check" type="text" placeholder="Name...">
                        </div>
                    </div>

                    <div class="uk-margin">
                        <label class="uk-form-label" for="edit-record-dialog-amount">Amount</label>
                        <div class="uk-form-controls">
                            <input v-model="amount" class="uk-input" id="edit-record-dialog-amount" type="number" placeholder="Amount..." @wheel="() => {/* vue intercepts the wheel event without this */}">
                        </div>
                    </div>
                    <!-- <calculator-input ref="amount" :decimals="2" v-model="amount" label="Amount"/> -->
                
                    <div class="uk-margin">
                        <div class="uk-form-controls">
                            <label><input v-model="paid" class="uk-checkbox" type="checkbox" id="edit-record-dialog-paid"> Paid</label><br>
                            <label><input v-model="scheduled" class="uk-checkbox" type="checkbox" id="edit-record-dialog-scheduled"> Scheduled</label><br>
                        </div>
                    </div>

                    <div class="uk-margin">
                        <label class="uk-form-lable" for="edit-record-dialog-note">Notes</label>
                        <div class="uk-form-controls">
                            <textarea v-model="note" class="uk-textarea" rows="5" id="edit-record-dialog-note" placeholder="Notes..."></textarea>
                        </div>
                    </div>

                </form>                
            </div>
            <div class="uk-modal-footer uk-text-right">
                <button class="uk-button uk-button-default uk-modal-close" type="button">Cancel</button>
                <button @click="save" class="uk-button uk-button-primary" type="button" id="edit-record-dialog-save">Save</button>
            </div>

        </div>
    </div>      
</template>

<script>
import UIkit from 'uikit';
import Firebase from '../data/firebase';
// import CalculatorInput from "./CalculatorInput.vue";

export default {
    components: {
        // CalculatorInput
    },
    data: function () {
        return {
            transaction: undefined,
            deposit: false
        }
    },
    methods: {
        save() {
            let editor = this;
            this.transaction.amount = Math.abs(this.transaction.amount) * (this.deposit ? 1 : -1);
            Firebase.saveTransaction(this.transaction).then(
                function() { 
                    UIkit.modal(editor.$el).hide(); 
                    editor.transaction = null;
                }
            ).catch(
                function(reason) {
                    console.log('ERROR:', reason);
                }
            )
        },
        newTransaction() {
            this.transaction = null; // empty
            this.transaction = {
                date: this.date,
                category: this.category,
                name: this.name,
                amount: this.amount * (this.deposit ? 1 : -1),
                cash: this.cash,
                transfer: this.transfer,
                check: this.check,
                paid: this.paid,
                scheduled: this.scheduled,
                note: this.note
            };
            this.deposit = false;
            UIkit.modal(this.$el).show();
        }
    },
    watch: {
        transaction: function(newVal) {
            if (newVal && (newVal.amount !== undefined)) {
                this.deposit = newVal.amount > 0;
            }
        }
    },
    computed: {
        config() {
            return this.$store.state.config;
        },
        mode() {
            if (this.transaction && this.transaction._key) {
                return "Edit";
            }
            return "New";
        },
        date: {
            get: function() {
                if (this.transaction) { return this.transaction.date; }
                return this.$store.state.period.start.toISODate();
            },
            set: function(val) {
                if (this.transaction) {
                    this.transaction.date = val;
                }
            }
        },
        category: {
            get: function() {
                if (this.transaction) { return this.transaction.category; }
                return this.config.categories[0];
            },
            set: function(val) {
                if (this.transaction) {
                    this.transaction.category = val;
                }
            }
        },
        name: {
            get: function() {
                if (this.transaction) { return this.transaction.name; }
                return "";
            },
            set: function(val) {
                if (this.transaction) {
                    this.transaction.name = val;
                }
            }
        },
        amount: {
            get: function() {
                if (this.transaction) { return Math.abs(this.transaction.amount); }
                return 0;
            },
            set: function(val) {
                if (this.transaction) {
                    this.transaction.amount = parseFloat(val) * (this.deposit ? 1 : -1);
                }
            }
        },
        cash: {
            get: function() {
                if (this.transaction) { return this.transaction.cash === true; }
                return false;
            },
            set: function(val) {
                if (this.transaction) {
                    this.transaction.cash = val;
                }
            }
        },
        transfer: {
            get: function() {
                if (this.transaction) { return this.transaction.transfer === true; }
                return false;
            },
            set: function(val) {
                if (this.transaction) {
                    this.transaction.transfer = val;
                }
            }
        },
        check: {
            get: function() {
                if (this.transaction) { return this.transaction.check; }
                return "";
            },
            set: function(val) {
                if (this.transaction) {
                    this.transaction.check = val;
                }
            }
        },
        paid: {
            get: function() {
                if (this.transaction) { return this.transaction.paid === true; }
                return false;
            },
            set: function(val) {
                if (this.transaction) {
                    this.transaction.paid = val;
                }
            }
        },
        scheduled: {
            get: function() {
                if (this.transaction) { return this.transaction.scheduled === true; }
                return false;
            },
            set: function(val) {
                if (this.transaction) {
                    this.transaction.scheduled = val;
                }
            }
        },
        note: {
            get: function() {
                if (this.transaction) { return this.transaction.note; }
                return "";
            },
            set: function(val) {
                if (this.transaction) {
                    this.transaction.note = val;
                }
            }
        },
    }
}
</script>