export const loadIcon = () => {
  const iconSizeS = '0 0 16 16'
  // 删除元素
  const delNotes = /<!--[\s\S]*?-->/g
  const delXml = /<\?xml [\s\S]*?>/g
  const delTitle = /<title>[\s\S]*?<\/title>/g
  const delDefs = /<defs>[\s\S]*?<\/defs>/g
  const delStyle = /<style [\s\S]*?>[\s\S]*?<\/style>/g
  const delGroupA = /<g [\s\S]*?>/g
  const delId = / id="[\s\S]*?"/g
  const delGroupB = /<\/g>/g
  // const delWidth = / width=\"[\s\S]*?\"/;
  // const delHeight = / height=\"[\s\S]*?\"/;
  const delXmlns = / xmlns:xlink="[\s\S]*?"/g
  const delVersion = / version="[\s\S]*?"/g
  const delArr = [
    delNotes,
    delXml,
    delVersion,
    delXmlns,
    delTitle,
    delStyle,
    delGroupA,
    delGroupB,
    delId,
    delDefs,
  ]

  // 加入代码
  const addString = ` vector-effect="non-scaling-stroke"`
  const svgTagOpen = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">`
  const svgTagClose = `</svg>`

  // let svgWrapCodeArrPass = [];
  // let svgCodeArrPass = [];
  // let svgNameArrPass = [];

  let svgName: string
  let svgDescription: string
  let svgWrapCode: string
  let svgDom: string
  let svgCode: string
  let svgWrap: Uint8Array
  const svgWrapCodeArr = []
  const svgCodeArr = []
  const svgNameArr = []
  const svgDomArr = []
  let svgFrame: string

  if (figma.currentPage.selection.length > 0) {
    for (let i = 0; i < figma.currentPage.selection.length; i++) {
      const node = figma.currentPage.selection[i]
      if (node.type === 'COMPONENT') {
        // console.log(node);
        ;(async () => {
          function Uint8ArrayToString(res: string | any[] | Uint8Array) {
            let dataString = ''
            for (let i = 0; i < res.length; i++) {
              dataString += String.fromCharCode(res[i])
            }
            return dataString
          }

          svgWrap = await node.exportAsync({ format: 'SVG' })

          svgWrapCode = Uint8ArrayToString(svgWrap) // 输出原始 svg 代码

          svgWrapCodeArr.push(svgWrapCode)
          console.log(svgWrapCodeArr)

          svgName = node.name
          svgNameArr.push(svgName)
          //  console.log(svgNameArr);
          svgDescription = `<desc>${node.description}</desc>`
          svgDom = `<div class='iconContainer'>${svgWrapCodeArr[i]}</div>`
          svgDomArr.push(svgDom)
          svgFrame = svgDomArr.join('')

          figma.ui.postMessage({
            type: 'svg-data',
            svgWrapCode,
            svgWrapCodeArr,
            svgFrame,
          })

          // 判断icon尺寸
          if (svgWrapCode.indexOf(iconSizeS) === -1) {
            figma.notify('输出尺寸不规范,请重新检查')
            figma.closePlugin()
          } else {
            // 删除不需要的元素
            for (let i = 0; i < delArr.length; i++) {
              svgWrapCode = svgWrapCode.replace(RegExp(delArr[i], 'g'), '')
            }
            // 删除换行
            svgWrapCode = svgWrapCode.replace(/\n*/g, '')

            let svgMatch: any = svgWrapCode.match(
              /<path[\s\S]*?\/>|<circle[\s\S]*?\/>/g,
            )
            // console.log(node.children.length);
            // console.log(svgMatch.length);
            if (svgMatch.length === node.children.length) {
              for (let i = 0; i < svgMatch.length; i++) {
                svgMatch[i] = svgMatch[i].replace(
                  '/>',
                  `${addString} id="area${[i + 1]}"/>`,
                )
              }
            } else {
              figma.notify('svg路径合并有问题，请重新检查路径')
            }

            svgMatch = svgMatch.join('\n')

            // console.log(svgMatch);

            svgCode = `${svgTagOpen}\n${svgDescription}\n${svgMatch}\n${svgTagClose}`

            // console.log(svgCode);

            svgCodeArr.push(svgCode)

            // svgWrapCodeArrPass = svgWrapCodeArr;
            // svgCodeArrPass = svgCodeArr;
            // svgNameArrPass = svgNameArr;
          }
        })()
      } else {
        console.log(node.type)
        figma.notify('类型错误,请选择Component(母组件图层)!')
      }
    }
  } else {
    figma.notify('请选择图标')
  }
}
