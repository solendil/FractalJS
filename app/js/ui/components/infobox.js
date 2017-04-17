import Vue from 'vue';

/*
  <infobox
    v-bind:message=''
    v-on:increment="incrementTotal"
  > </infobox>
  <infobox :message=''> </infobox>
*/

Vue.component('infobox', {
  props: ['message'],
  template: '<div v-on:click="increment">{{ hello }} world, {{ message }}</div>'
  data: () => ({
    hello: 'Hello'
  }),
  computed: {
    capitalMessage: function () {
      return this.message.trim().toUpperCase();
    }
  },
  methods: {
    increment: function () {
      this.counter += 1
      this.$emit('increment')
    }
  },
});

/*
using vue as a message bus : empty vue instance, then
var bus = new Vue()
// in component A's method
bus.$emit('id-selected', 1)
// in component B's created hook
bus.$on('id-selected', function (id) {
  // ...
})
*/