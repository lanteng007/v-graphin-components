<template>
  <div class="graphin-components-minimap" ref="minimap"></div>
</template>
<script>
import { G6 } from "v-graphin"
export default {
  name: "MiniMap",
  inject: ["graphin", "setGraphinProperty"],
  props: {
    visible: {
      type: Boolean,
      default: true,
    },
    options: {
      type: Array,
      default: null
    },
  },
  data() {
    return {
      defaultOptions: {
        className: 'graphin-minimap',
        viewportClassName: 'graphin-minimap-viewport',
        // Minimap 中默认展示和主图一样的内容，KeyShape 只展示节点和边的 key shape 部分，delegate表示展示自定义的rect，用户可自定义样式
        type: 'default',
        padding: 50,
        size: [200, 120],
        delegateStyle: {
          fill: '#40a9ff',
          stroke: '#096dd9',
        },
        refresh: true,
      },
      miniMap: null
    }
  },
  mounted() {
    const containerRef = this.$refs.minimap || null
    const { graph } = this.graphin;
    const { options = [] } = this;
     const width = graph.getWidth();
    const height = graph.getHeight();
    const padding = graph.get('fitViewPadding');
    const containerHeight = 120;

    const containerSize = [((width - padding * 2) / (height - padding * 2)) * containerHeight, containerHeight];

    const miniMapOptions = {
      container: containerRef,
      ...this.defaultOptions,
      size: containerSize,
      ...options,
    };

    this.miniMap = new G6.Minimap(miniMapOptions);
    graph.addPlugin(this.miniMap);
  },
  beforeDestroy() {
    const { graph } = this.graphin;
    if (this.miniMap && !this.miniMap.destroyed) {
      graph.removePlugin(this.miniMap);
    }
  }
};
</script>
<style lang="scss" scoped>
.graphin-components-minimap {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #fff;
  box-shadow: 0px 8px 10px -5px rgba(0, 0, 0, 0.2),
    0px 16px 24px 2px rgba(0, 0, 0, 0.14), 0px 6px 30px 5px rgba(0, 0, 0, 0.12);
}
</style>