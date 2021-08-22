<template>
    <div id="edit-recur-dialog" uk-modal="bg-close: false">
        <div class="uk-modal-dialog">
            <div class="uk-modal-header">
                <h2 class="uk-modal-title">{{ mode }} Recurring</h2>
                    <div v-if="transaction && transaction._key" class="uk-navbar-container uk-navbar-transparent uk-section-default uk-padding-small" uk-navbar>
                        <!-- only show for existing items -->
                        <div class="uk-navbar-left">
                            <ul class="uk-iconnav">
                                <li><a href="#" ref="btnDelete" @click.prevent="deleteTransaction" uk-icon="icon: trash" uk-tooltip="Delete this recurring transaction"></a></li>
                            </ul>
                        </div>
                    </div>
            </div>

            <div class="uk-modal-body" uk-overflow-auto>
                <form class="uk-form-stacked">

                    <div class="uk-margin">
                        <label class="uk-form-label" for="edit-recur-dialog-period">Period</label>
                        <div class="uk-form-controls">
                            <input v-model="period" class="uk-input" id="edit-recur-dialog-period" type="text" placeholder="Name...">
                        </div>
                    </div>

                    <div class="uk-margin">
                        <label class="uk-form-label" for="edit-recur-dialog-start">From</label>
                        <div class="uk-form-controls">
                            <input v-model="start" class="uk-input" id="edit-recur-dialog-start" type="date" placeholder="Some text...">
                        </div>
                    </div>

                    <div class="uk-margin">
                        <label class="uk-form-label" for="edit-recur-dialog-end">Until</label>
                        <div class="uk-form-controls">
                            <input v-model="end" class="uk-input" id="edit-recur-dialog-end" type="date" placeholder="Some text...">
                        </div>
                    </div>
                
                    <div class="uk-margin">
                        <label class="uk-form-label" for="edit-recur-dialog-category">Category</label>
                        <div class="uk-form-controls">
                            <select v-model="category" class="uk-select" id="edit-recur-dialog-category">
                                <option v-for="category in config.categories" :key="category">{{ category }}</option>
                            </select>
                        </div>
                    </div>

                    <div class="uk-margin">
                        <label class="uk-form-label" for="edit-recur-dialog-name">Name</label>
                        <div class="uk-form-controls">
                            <input v-model="name" class="uk-input" id="edit-recur-dialog-name" type="text" placeholder="Name...">
                        </div>
                    </div>

                    <div class="uk-margin">
                        <div class="uk-form-controls">
                            <label><input v-model="deposit" class="uk-checkbox" type="checkbox" id="edit-recur-dialog-deposit"> Deposit</label><br>
                            <label><input v-model="cash" class="uk-checkbox" type="checkbox" id="edit-recur-dialog-cash"> Cash</label><br>
                            <label><input v-model="transfer" class="uk-checkbox" type="checkbox" id="edit-recur-dialog-transfer"> Transfer</label><br>
                        </div>
                    </div>

                    <div class="uk-margin">
                        <label class="uk-form-label" for="edit-recur-dialog-amount">Amount</label>
                        <div class="uk-form-controls">
                            <input v-model="amount" class="uk-input" id="edit-record-dialog-amount" type="number" placeholder="Amount..." @wheel="() => {/* vue intercepts the wheel event without this */}">
                        </div>
                    </div>
                    <!-- <calculator-input ref="amount" :decimals="2" v-model="amount" label="Amount"/> -->
                
                    <div class="uk-margin">
                        <div class="uk-form-controls">
                            <label><input v-model="scheduled" class="uk-checkbox" type="checkbox" id="edit-recur-dialog-scheduled"> Scheduled</label><br>
                        </div>
                    </div>

                    <div class="uk-margin">
                        <label class="uk-form-lable" for="edit-recur-dialog-note">Notes</label>
                        <div class="uk-form-controls">
                            <textarea v-model="note" class="uk-textarea" rows="5" id="edit-recur-dialog-note" placeholder="Notes..."></textarea>
                        </div>
                    </div>

                </form>                
            </div>
            <div class="uk-modal-footer uk-text-right">
                <button class="uk-button uk-button-default uk-modal-close" type="button">Cancel</button>
                <button @click="save" class="uk-button uk-button-primary" type="button" id="edit-recur-dialog-save">Save</button>
            </div>

        </div>
    </div>      
</template>

<script>
import UIkit from 'uikit';
import Firebase from '../data/firebase';
// import CalculatorInput from "./CalculatorInput.vue";

    // amount : number;
    // cash? : boolean;
    // category : string;
    // end : string;
    // name : string;
    // note? : string;
    // period : string;
    // start : string;
    // transfer? : boolean;
    // active?: string;
    // delete?: string;
    // scheduled?: boolean;

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
            // set the active date so the server knows to create the transactions
            this.transaction.active = this.$store.state.period.start.toISODate();

            Firebase.saveRecurring(this.transaction).then(
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
        async deleteTransaction() {
            try {
                await UIkit.modal.confirm(`Delete recurring ${this.transaction.name} in ${this.transaction.category}?`);
                // set the delete date so the server knows to delete the transactions
                this.transaction.delete = this.$store.state.period.start.toISODate();
                await Firebase.saveRecurring(this.transaction);
            } catch {
                // nothing to do 
            }
        },
        newTransaction() {
            this.transaction = null; // empty
            this.transaction = {
                period: this.period,
                start: this.start,
                end: this.end,
                date: this.date,
                category: this.category,
                name: this.name,
                amount: this.amount * (this.deposit ? 1 : -1),
                cash: this.cash,
                transfer: this.transfer,
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
        period: {
            get: function() {
                if (this.transaction) { return this.transaction.period; }
                return "1 month";
            },
            set: function(val) {
                if (this.transaction) {
                    this.transaction.period = val;
                }
            }
        },
        start: {
            get: function() {
                if (this.transaction) { return this.transaction.start; }
                return this.$store.state.period.start.toISODate();
            },
            set: function(val) {
                if (this.transaction) {
                    this.transaction.start = val;
                }
            }
        },
        end: {
            get: function() {
                if (this.transaction) { return this.transaction.end; }
                return this.$store.state.period.start.plus({ years: 1 }).toISODate();
            },
            set: function(val) {
                if (this.transaction) {
                    this.transaction.end = val;
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