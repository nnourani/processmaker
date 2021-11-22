<template>
  <div>
    <iframe
      :width="width"
      ref="xIFrame"
      frameborder="0"
      :src="pageUri"
      :height="height"
      allowfullscreen
    ></iframe>
  </div>
</template>

<script>
export default {
  name: "LegacyFrame",
  components: {},
  props: {
    pageUri: String,
  },
  mounted() {
    this.height = window.innerHeight - this.diffHeight;
  },
  data() {
    return {
      height: "100%",
      width: "100%",
      diffHeight: 10
    };
  },
  methods: {
    classBtn(cls) {
      return "btn v-btn-request " + cls;
    },
  },
};
</script>

<style>
</style>
