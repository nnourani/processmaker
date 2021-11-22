<template>
  <div class="pm-vue-list">
    <div class="card pm-vue-list-inside" @dblclick.prevent="dblClick">
      <div class="list-body">
        <slot> </slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "VueCardView",
  props: ["item","options"],
  data() {
    return {};
  },
  methods: {
    classBtn(cls) {
      return "btn btn-slim btn-force-radius v-btn-header " + cls;
    },
    /**
     * Event handler dbl click
     */
    dblClick(event){
      this.options.dblClick(event, this.item, this.options);
    }
  },
};
</script>

<style>
.pm-vue-list {
  padding: 0.7rem 0.7rem 0rem 0.7rem;
}
.pm-vue-list-inside {
  border-left: solid lightseagreen;
  color: #212529;
  background-color: #f8f9fa;
}
.pm-vue-list-inside:hover {
  background-color: #cfd9e4;
}
.list-body {
  height: 224px;
  overflow-x: hidden;
  flex: 1 1 auto;
  min-height: 1px;
  padding: 1.25rem;
}
</style>
