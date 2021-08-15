<template>
    <div class="uk-inline">
        <span class="uk-hidden-notouch">
            <a class="uk-form-icon uk-form-icon-flip" uk-icon="icon: grid" href="" @click.prevent="changeInputMode"></a>
        </span>
        <input class="uk-input" ref="input" type="text" inputmode="decimal" :class="valid ? '' : 'invalid'" 
            :name="name" :value="value" @change="onChange" @keydown="onKeyDown" 
            @wheel.exact.prevent="(evt) => onMouseWheel(evt,1)" 
            @wheel.shift.exact.prevent="(evt) => onMouseWheel(evt,5)"/>
    </div>
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
        name: {
            type: String,
            required: true
        },
        decimals: {
            type: Number,
            default: function() { return 2; }
        }
    },
    data: function() {
        return {
            valid: true
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
        },
        onMouseWheel(evt, inc=1) {
            if (this.isValid(this.$refs.input.value)) {
                console.log(evt);
                // on Mac, shift wheel moves in X
                if (evt.shiftKey && (Math.abs(evt.wheelDeltaY) == 0)) {
                    this.$refs.input.value += ` ${evt.wheelDeltaX > 0 ? '+' : '-'} ${inc}`;
                } else {
                    this.$refs.input.value += ` ${evt.wheelDeltaY > 0 ? '+' : '-'} ${inc}`;
                }
                this.calculate(this.$refs.input.value);
            }
        },
        isValid: function(formula) {
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
        calculate: function(formula) {
            if (this.isValid(formula)) {
                let val = parseFloat(eval(formula).toFixed(this.decimals));
                this.$emit('input', val);
                return val;
            }
            return Number.NaN;
        },
        changeInputMode: function() {
            if (this.$refs.input.getAttribute('inputmode') === "decimal") {
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
