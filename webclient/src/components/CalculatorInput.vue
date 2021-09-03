<template>
    <input class="uk-input" ref="input" type="text" inputmode="decimal" :class="valid ? '' : 'invalid'" 
        :value="value" @change="onChange" @keydown="onKeyDown" 
        @wheel.exact="(evt) => onMouseWheel(evt,1)" 
        @wheel.shift.exact="(evt) => onMouseWheel(evt,5)"
        @focus="onFocus" @focusout="offFocus"/>
</template>

<script>
import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';

UIkit.use(Icons);

const ALLOWED = ['Backspace', 'Enter', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight', 'Home', 'End', 'Delete', ...'0123456789. +-'];

export default {
    props: {
        value: {
            type: Number,
            required: true
        },
        decimals: {
            type: Number,
            default: function() { return 2; }
        }
    },
    data: function() {
        return {
            valid: true,
            focused: false
        }
    },
    methods: {
        onChange() {
            this.calculate(this.$refs.input.value);
        },
        onKeyDown: function (evt) {
            if (ALLOWED.indexOf(evt.key) < 0) {
                evt.preventDefault();
                return;
            }
            if (evt.key === 'ArrowUp') {
                evt.preventDefault();
                this.increment(1);
                return;
            }
            if (evt.key === 'ArrowDown') {
                evt.preventDefault();
                this.increment(-1);
                return;
            }
        },
        onMouseWheel(evt, inc=1) {
            if (this.focused) { 
                evt.preventDefault();
            } else {
                return;
            }
            if (this.isValid(this.$refs.input.value)) {
                // on Mac, shift wheel moves in X
                if (evt.shiftKey && (Math.abs(evt.wheelDeltaY) == 0)) {
                    this.$refs.input.value += ` ${evt.wheelDeltaX > 0 ? '+' : '-'} ${inc}`;
                } else {
                    this.$refs.input.value += ` ${evt.wheelDeltaY > 0 ? '+' : '-'} ${inc}`;
                }
                this.calculate(this.$refs.input.value);
            }
        },
        onFocus() {
            this.focused = true;
        },
        offFocus() {
            this.focused = false;
        },
        trimFormula(formula) {
            formula = formula.replace(/^0*/,'');
            if (formula == '') formula = '0';
            return formula;
        },
        isValid: function(formula) {
            formula = this.trimFormula(formula);
            if (formula.split('').some(s => ALLOWED.indexOf(s) < 0)) {
                // invalid text
                return false;
            } else {
               if (formula !== '') {
                   try {
                        eval(formula);
                        return true;
                   } catch {
                       return false;
                   }
               } 
            }
        },
        increment(inc) {
            if (this.isValid(this.$refs.input.value)) {
                this.$refs.input.value += ` ${Math.sign(inc) >= 0 ? '+' : '-'} ${Math.abs(inc)}`;
                this.calculate(this.$refs.input.value);
            }
        },
        calculate: function(formula) {
            formula = this.trimFormula(formula);
            if (this.isValid(formula)) {
                let val = parseFloat(eval(formula).toFixed(this.decimals));
                this.$emit('input', val);
                return val;
            }
            return Number.NaN;
        },
        performOutstanding: function() {
            this.calculate(this.$refs.input.value);
        },
        changeInputMode: function(extended) {
            if (extended) {
                this.$refs.input.setAttribute('inputmode', '')
            } else {
                this.$refs.input.setAttribute('inputmode', "decimal");
            }
            setTimeout(() => {
                this.$refs.input.click();
                this.$refs.input.focus();
            }, 100);
        }
    }
}
</script>
