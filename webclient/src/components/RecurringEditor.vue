<template>
    <div  uk-modal="bg-close: false">
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
                <form class="uk-form-stacked" @keypress.enter="save">
                    <a ref="re_top"></a>
                    <div class="uk-margin">
                        <label class="uk-form-label" for="re-dialog-period">Period</label>
                        <div class="uk-form-controls">
                            <input v-model="period" class="uk-input" id="re-dialog-period" type="text" placeholder="Period...">
                        </div>
                    </div>

                    <div class="uk-margin">
                        <label class="uk-form-label" for="re-dialog-start">From</label>
                        <div class="uk-form-controls">
                            <input v-model="start" class="uk-input" id="re-dialog-start" type="date" placeholder="Start Date...">
                        </div>
                    </div>

                    <div class="uk-margin">
                        <label class="uk-form-label" for="re-dialog-end">Until</label>
                        <div class="uk-form-controls">
                            <input v-model="end" class="uk-input" id="re-dialog-end" type="date" placeholder="End Date...">
                        </div>
                    </div>
                
                    <div class="uk-margin">
                        <label class="uk-form-label" for="re-dialog-category">Category</label>
                        <div class="uk-form-controls">
                            <select v-model="category" class="uk-select" id="re-dialog-category">
                                <option v-for="category in config.categories" :key="category">{{ category }}</option>
                            </select>
                        </div>
                    </div>

                    <div class="uk-margin">
                        <label class="uk-form-label" for="re-dialog-name">Name</label>
                        <div class="uk-form-controls">
                            <input v-model="name" class="uk-input" id="re-dialog-name" type="text" placeholder="Name..." list="transaction-names">
                        </div>
                    </div>

                    <div class="uk-margin">
                        <div class="uk-form-controls">
                            <label class="uk-padding-small"><input v-model="deposit" class="uk-checkbox" type="checkbox"> Deposit</label><br>
                            <label class="uk-padding-small"><input v-model="cash" class="uk-checkbox" type="checkbox"> Cash</label><br>
                            <label class="uk-padding-small"><input v-model="transfer" class="uk-checkbox" type="checkbox"> Transfer</label><br>
                        </div>
                    </div>

                    <div class="uk-margin">
                        <label class="uk-form-label" for="re-dialog-amount">Amount<span class="uk-hidden-notouch"> (<label><input type="checkbox" @click="(e) => setInputMode(e.target.checked)">Function Mode)</label></span></label>
                        <div class="uk-form-controls">
                            <calculator-input ref="amount" :decimals="2" v-model="amount" id="re-dialog-amount"/>
                        </div>
                    </div>

                    <div class="uk-margin">
                        <div class="uk-form-controls">
                            <label class="uk-padding-small"><input v-model="scheduled" class="uk-checkbox" type="checkbox"> Scheduled</label><br>
                        </div>
                    </div>

                    <div class="uk-margin">
                        <label class="uk-form-label" for="re-dialog-note">Notes</label>
                        <div class="uk-form-controls">
                            <textarea v-model="note" class="uk-textarea" rows="5" id="re-dialog-note" placeholder="Notes..."></textarea>
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
import CalculatorInput from "./CalculatorInput.vue";

export default {
    components: {
        CalculatorInput
    },
    data: function () {
        return {
            transaction: undefined,
            deposit: false
        }
    },
    methods: {
        setInputMode(extended) {
            this.$refs.amount.changeInputMode(extended);
        },
        async save(e) {
            if (e.target === this.$refs.amount.$el) return;
            if (e.target.tagName.toUpperCase() === 'TEXTAREA') return;
            this.$refs.amount.performOutstanding();
            this.transaction.amount = Math.abs(this.transaction.amount) * (this.deposit ? 1 : -1);

            await this.$store.saveRecurring(this.transaction);
            UIkit.modal(this.$el).hide(); 
            this.transaction = null;
        },
        async deleteTransaction() {
            try {
                await UIkit.modal.confirm(`Delete recurring ${this.transaction.name} in ${this.transaction.category}?`);
                await this.$store.deleteRecurring(this.transaction);
            } catch {
                // this catches if the user selects cancel 
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
            this.show();
        },
        show() {
            UIkit.modal(this.$el).show();
            UIkit.scroll(this.$refs.re_top).scrollTo(this.$refs.re_top);
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