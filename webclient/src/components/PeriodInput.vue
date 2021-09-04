<template>
    <input  type="text" v-bind:value="value" @input="validate"/>
</template>
<script>
import { Duration } from 'luxon';
import '../util/date';

window.Duration = Duration;

export default {
    data: function() {
        return {
            valid: false
        }
    },
    props: ['value'],
    methods: {
        validate(e) {
            let isValid = (e.target.value.length > 0) && Duration.validNatural(e.target.value);
            if (isValid !== this.valid) {
                this.valid = isValid;
                this.$emit('valid', { valid: this.valid });
                if (this.valid) {
                    e.target.classList.remove('ui-invalid');
                } else {
                    e.target.classList.add('ui-invalid');
                }
            }
            // emit the value change last so valid is up to date
            this.$emit('input', e.target.value);
        }
    }
}
</script>