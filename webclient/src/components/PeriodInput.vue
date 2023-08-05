<template>
    <input ref="input" type="text" v-bind:value="value" @input="validate"/>
</template>
<script>
import { Duration } from 'luxon';
import '../util/date';

window.Duration = Duration;

export default {
    props: ['value'],
    computed: {
        valid: {
            get: function() {
                let isValid = (this.$refs.input.value.length > 0) && Duration.validNatural(this.$refs.input.value);
                return isValid;
            }
        }
    },
    methods: {
        validate() {
            // let isValid = (this.$refs.input.value.length > 0) && Duration.validNatural(this.$refs.input.value);
            this.$emit('valid', { valid: (this.$refs.input.value.length > 0) && Duration.validNatural(this.$refs.input.value) });
            if ((this.$refs.input.value.length > 0) && Duration.validNatural(this.$refs.input.value)) {
                this.$refs.input.classList.remove('ui-invalid');
            } else {
                this.$refs.input.classList.add('ui-invalid');
            }
            // emit the value change last so valid is up to date
            this.$emit('input', this.$refs.input.value);
        }
    }
}
</script>