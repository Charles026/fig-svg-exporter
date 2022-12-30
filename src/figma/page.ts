export const loadIcon = () => {
  console.log(this)

  let svgData: Uint8Array

  if (figma.currentPage.selection.length > 0) {
    for (let i = 0; i < figma.currentPage.selection.length; i++) {
      const node = figma.currentPage.selection[i]
      if (node.type === 'COMPONENT' || node.type === 'INSTANCE') {
        console.log(node)
        ;(async () => {
          svgData = await node.exportAsync({
            format: 'SVG',
            svgIdAttribute: true,
          })
          figma.ui.postMessage({ type: 'icon-data', svgData })
        })()
      } else {
        console.log(node.type)
        figma.notify('类型错误,请选择组件或实例!')
      }
    }
  } else {
    figma.notify('请选择图标')
  }
}
