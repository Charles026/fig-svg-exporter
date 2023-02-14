// 定位图层
export const select = async (payload) => {
  // console.log('selected');

  // for (let i = 0; i < figma.root.children.length; i++) {
  //   if(figma.root.children[i].findOne(n => n.id === payload) !== null) {
  //     // console.log('found',figma.root.children[i]);
  //     figma.currentPage = figma.root.children[i];
  //   }
  // }
  const nodeSelect = figma.currentPage.findAll((node) => node.id === payload)
  figma.currentPage.selection = nodeSelect
  figma.viewport.scrollAndZoomIntoView(nodeSelect)
}

export const loadIcon = () => {
  console.log('load msg')

  let svgData: Uint8Array
  const nodes = figma.currentPage.selection

  const svgDataArr = []

  const getSvgData = async (node) => {
    svgData = await node.exportAsync({
      format: 'SVG',
      svgIdAttribute: true,
    })
    return svgData
  }

  ;(async () => {
    if (nodes.length > 0) {
      figma.ui.postMessage({ type: 'get-icons' })

      const nodeNameData = []
      const nodeIDArr = []
      const iconNameArr = []
      const nodeTypeArr = []
      const iconDescArr = []

      nodes.forEach((node) => {
        const childNodes = (node as FrameNode).children
        const childNodeNames = []
        childNodes.forEach((childNode) => {
          childNodeNames.push(childNode.name)
        })
        nodeNameData.push({ id: node.name, childNodeNames: childNodeNames })

        nodeIDArr.push(node.id)
        iconNameArr.push(node.name)
        nodeTypeArr.push(node.type)
        iconDescArr.push((node as ComponentNode).description)
      })

      // const nodeIDArr = nodes.map((node) => node.id)
      // const iconNameArr = nodes.map((node) => node.name)
      // const nodeTypeArr = nodes.map((node) => node.type)
      // const iconDescArr = nodes.map((node) => (node as ComponentNode).description)

      for (const node of nodes) {
        svgDataArr.push(await getSvgData(node))
        // if (node.type !== 'COMPONENT') {
        //   // console.log(node);
        //   console.log(node.type)
        //   figma.notify('选择图层类型错误,请选择Component!')
        // }
      }

      figma.ui.postMessage({
        type: 'load-icon',
        svgDataArr,
        iconNameArr,
        iconDescArr,
        nodeIDArr,
        nodeTypeArr,
        nodeNameData,
      })
    } else {
      figma.notify('请选择图标')
      figma.ui.postMessage({ type: 'no-selection' })
    }
  })()
}

// export const download = () => {
//   console.log('downloading');

//   figma.ui.postMessage({type:'download-icon'})
// }
