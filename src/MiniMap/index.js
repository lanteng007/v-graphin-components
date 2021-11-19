import MiniMap from "./MiniMap"

MiniMap.install = function(Vue) {
  Vue.component(MiniMap.name, MiniMap);
}

export default MiniMap