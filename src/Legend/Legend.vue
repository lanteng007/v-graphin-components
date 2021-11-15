<template>
  <div class="graphin-components-legend">
    <ul class="graphin-components-legend-content">
      <li
        class="item"
        v-for="option in options"
        :key="option.value"
        @click="handleClick(option)"
      >
        
        <span
          class="dot"
          :class="option.icon ? 'has-icon' : ''"
          :style="{
            background: getDotColors(option)[option.checked ? 'active' : 'inactive'],
            borderColor: option.icon ? getDotColors(option,1)[option.checked ? 'active' : 'inactive'] : '',
          }"
        >
          <span v-if="option.icon && option.icon.type === 'font'" :style="option.icon.style">{{option.icon.value}}</span>
          <img v-if="option.icon && option.icon.type === 'image'" :src="option.icon.value" :width="option.icon.style.width" :height="option.icon.style.height">
        </span>
        <span
          class="label"
          :style="{
            color: labelColor[mode][option.checked ? 'active' : 'inactive'],
          }"
          >{{ option.label }}</span>
      </li>
    </ul>
  </div>
</template>
<script>
import hexToRgba from "../Utils/hexToRgba";
export default {
  name: "Legend",
  inject: ["graphin", "setGraphinProperty"],
  props: {
    /** 绑定的类型 */
    bindType: {
      type: String,
      default: "node",
    },
    /**
     * @description 分类映射的Key值
     */
    sortKey: {
      type: String,
      default: "",
    },
    /**
     * @description  颜色映射的Key值
     * @default "style.stroke"
     */
    colorKey: {
      type: String,
      default: "style.stroke",
    },
  },
  data() {
    return {
      options: [],
      dataMap: null,
      mode: this.graphin.curtheme.mode,
      labelColor: {
        light: {
          active: "#000",
          inactive: "#ddd",
        },
        dark: {
          active: "#fff",
          inactive: "#2f2f2f",
        },
      },
    };
  },
  methods: {
    getEnumValue(keyString, data) {
      const keyArray = keyString.split(".");
      const enumValue = keyArray.reduce((acc, curr) => {
        return acc[curr] || {};
      }, data);
      if (typeof enumValue === "object") {
        if(keyString.indexOf("icon") !== -1) {
          return enumValue
        }
        return "others";
      }
      return enumValue;
    },
    calculate({ bindType, sortKey, graph, colorKey }) {
      const data = graph.save();

      const treeData = data;
      const graphData = data;
      const nodeMapByMapKey = new Map();
      const edgeMapByMapKey = new Map();
      /** 暂时不支持treeGraph的legend */
      if (treeData.children) {
        console.error("not support tree graph");
        return {
          dataMap: new Map(),
          options: {},
        };
      }

      const { nodes = [], edges = [] } = graphData;

      if (bindType === "node") {
        nodes.forEach((node) => {
          /** 得到枚举值 */
          const enumValue = this.getEnumValue(sortKey, node);
          /** 按照枚举值重新将节点存放 */
          const current = nodeMapByMapKey.get(enumValue);
          if (current) {
            nodeMapByMapKey.set(enumValue, [...current, node]);
          } else {
            nodeMapByMapKey.set(enumValue, [node]);
          }
        });
        /** 计算legend.content 的 options */
        const keys = [...nodeMapByMapKey.keys()];
        const options = keys.map((key) => {
          const node = (nodeMapByMapKey.get(key) || [{}])[0];
          const color = this.getEnumValue(colorKey, node);
          const icon = this.getEnumValue("style.icon",node)
          const { fontFamily, size, fill, value, type} = icon
          let iconStyle = {
            fontFamily,
            fontSize: size,
            color: fill,
          }
          if(type === 'font') {
            iconStyle = {
              fontFamily,
              fontSize: size + 'px',
              color: fill,
            }
          }
          if(type === 'image') {
            const isArray = Array.isArray(size)
            const width = isArray ? isArray[0]: size || 24
            const height = isArray ? isArray[1] ? isArray[1] : isArray[0] : size || 24
            iconStyle = {
              width,
              height,
            }
          }
          return {
            /** 颜色 */
            color,
            /** 值 */
            value: key,
            /** 标签 */
            label: key,
            /** 是否选中 */
            checked: true,
            icon: {
              style: iconStyle,
              type,
              value: value
            }
          };
        });
        return {
          dataMap: nodeMapByMapKey,
          options,
        };
      }
      // if (bindType === 'edge') {
      edges.forEach((edge) => {
        /** 得到枚举值 */
        const enumValue = this.getEnumValue(sortKey, edge);

        const current = edgeMapByMapKey.get(enumValue);
        if (current) {
          edgeMapByMapKey.set(enumValue, [...current, edge]);
        } else {
          edgeMapByMapKey.set(enumValue, [edge]);
        }
      });
      /** 计算legend.content 的 options */
      const keys = [...edgeMapByMapKey.keys()];
      const options = keys.map((key) => {
        const edge = (edgeMapByMapKey.get(key) || [{}])[0];
        const color = this.getEnumValue(colorKey, edge);
        return {
          /** 颜色 */
          color,
          /** 值 */
          value: key,
          /** 标签 */
          label: key,
          /** 是否选中 */
          checked: true,
        };
      });

      return { dataMap: edgeMapByMapKey, options };
    },
    getDotColors({ color }, a = 0.2) {
      const rgba = hexToRgba(color, a)
      const dotColors = {
        light: {
          active: rgba,
          inactive: "#ddd",
        },
        dark: {
          active: rgba,
          inactive: "#2f2f2f",
        },
      };
      return dotColors[this.mode];
    },
    handleClick(option) {
      const checkedValue = { ...option, checked: !option.checked };
      const result = this.options.map((c) => {
        const matched = c.value === option.value;
        return matched ? checkedValue : c;
      });
      this.options = result;
      const nodes = this.dataMap.get(checkedValue.value);

      /** highlight */
      // const nodesId = nodes.map((c) => c.id);
      // apis.highlightNodeById(nodesId);

      nodes.forEach((node) => {
        this.graphin.graph.setItemState(
          node.id,
          "active",
          checkedValue.checked
        );
        this.graphin.graph.setItemState(
          node.id,
          "inactive",
          !checkedValue.checked
        );
      });

      /** 给用户的回调函数 */
      // onChange(checkedValue, result, props);
      this.$emit("change", checkedValue, result);
    },
  },
  created() {
    const { graph } = this.graphin;
    const { bindType, sortKey, colorKey = "style.stroke" } = this;
    const { dataMap, options } = this.calculate({
      bindType,
      sortKey,
      graph,
      colorKey,
    });

    this.dataMap = dataMap;
    this.options = options;
    const legend = {
      ...this.graphin.legend,
      // 一个Graphin组件下，最多仅有2个Legend组件：node和edge
      [bindType]: {
        bindType,
        sortKey,
        colorKey,
        dataMap,
        options,
      },
    };
    this.setGraphinProperty("legend", legend);
  },
};
</script>
<style lang="scss" scoped>
.graphin-components-legend {
  position: absolute;
  top: 0;
  right: 0;
  ul.graphin-components-legend-content {
    display: block;
    position: relative;
    margin: 0px;
    padding: 0px;
    li.item {
      display: inline-flex;
      align-items: center;
      margin: 5px 10px;
      cursor: pointer;
      & > .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: inline-block;
        box-sizing: border-box;
        &.has-icon {
          width: auto;
          height: auto;
          padding: 4px;
          border: 1px solid transparent;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
      }
      & > .label {
        padding: 0px 5px;
        font-size: 12px;
        display: inline-block;
        vertical-align: baseline;
      }
    }
  }
}
</style>