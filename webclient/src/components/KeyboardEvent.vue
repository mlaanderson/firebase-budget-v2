<template>
  <div></div>
</template>
  
<script>
  export default {
    created() {
      const component = this;
      this.upHandler = function (e) {
        component.$emit('keyup', e);
      }
      this.downHandler = function (e) {
        component.$emit('keydown', e);
      }
      window.addEventListener('keyup', this.upHandler);
      window.addEventListener('keydown', this.downHandler);
    },
    beforeDestroy() {
      window.removeEventListener('keyup', this.upHandler);
      window.removeEventListener('keydown', this.downHandler);
    }
  }
</script>
  
<style scoped>
  div {
    display: none;
  }
</style>