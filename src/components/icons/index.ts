import { defineComponent, h } from 'vue'

// 定义SVG图标组件
export const LayoutDashboard = defineComponent({
  name: 'LayoutDashboard',
  setup() {
    return () =>
      h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          width: '24',
          height: '24',
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: '2',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        },
        [
          h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' }),
          h('line', { x1: '3', y1: '9', x2: '21', y2: '9' }),
          h('line', { x1: '9', y1: '21', x2: '9', y2: '9' }),
        ],
      )
  },
})

export const Users = defineComponent({
  name: 'Users',
  setup() {
    return () =>
      h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          width: '24',
          height: '24',
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: '2',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        },
        [
          h('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
          h('circle', { cx: '9', cy: '7', r: '4' }),
          h('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
          h('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' }),
        ],
      )
  },
})

export const FileText = defineComponent({
  name: 'FileText',
  setup() {
    return () =>
      h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          width: '24',
          height: '24',
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: '2',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        },
        [
          h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
          h('polyline', { points: '14 2 14 8 20 8' }),
          h('line', { x1: '16', y1: '13', x2: '8', y2: '13' }),
          h('line', { x1: '16', y1: '17', x2: '8', y2: '17' }),
          h('polyline', { points: '10 9 9 9 8 9' }),
        ],
      )
  },
})

export const PenTool = defineComponent({
  name: 'PenTool',
  setup() {
    return () =>
      h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          width: '24',
          height: '24',
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: '2',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        },
        [
          h('path', { d: 'M12 19l7-7 3 3-7 7-3-3z' }),
          h('path', { d: 'M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z' }),
          h('path', { d: 'M2 2l7.586 7.586' }),
          h('circle', { cx: '11', cy: '11', r: '2' }),
        ],
      )
  },
})

export const BarChart3 = defineComponent({
  name: 'BarChart3',
  setup() {
    return () =>
      h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          width: '24',
          height: '24',
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: '2',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        },
        [
          h('path', { d: 'M3 3v18h18' }),
          h('path', { d: 'M18 17V9' }),
          h('path', { d: 'M13 17V5' }),
          h('path', { d: 'M8 17v-3' }),
        ],
      )
  },
})

export const Download = defineComponent({
  name: 'Download',
  setup() {
    return () =>
      h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          width: '24',
          height: '24',
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: '2',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        },
        [
          h('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
          h('polyline', { points: '7 10 12 15 17 10' }),
          h('line', { x1: '12', y1: '15', x2: '12', y2: '3' }),
        ],
      )
  },
})
