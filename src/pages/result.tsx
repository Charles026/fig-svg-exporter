import React from 'react'
import { useHistory } from 'react-router-dom'
import { ArrowLeftOutlined } from '@ant-design/icons'
import JSZip from 'jszip'
import FileSaver from 'file-saver'
import { Button } from 'antd'

const Result = () => {
  const history = useHistory()

  const handleClick = () => {
    history.push('/')
  }

  // const onDownload = () => {
  //   parent.postMessage({ pluginMessage: {type:'storage.download'}}, '*')
  // }

  const svgStringArr = []

  let svgString: string
  // let iconNameArr = [];

  // const segment = document.getElementById('segment-control');

  onmessage = (event) => {
    console.log('receive msg')
    const msg = event.data.pluginMessage
    const svgDataArr = msg.svgDataArr
    const nodeIDArr = msg.nodeIDArr
    const iconNameArr = msg.iconNameArr
    const iconDescArr = msg.iconDescArr
    // const nodeTypeArr = msg.nodeTypeArr
    const iconList = document.getElementById('list-container')
    const count = document.getElementById('count')
    const error = document.getElementById('error')
    // const iconArr = []
    // const viewSize = `width="16" height="16" viewBox="0 0 16 16"`

    if (msg.type === 'load-icon') {
      for (let i = 0; i < iconNameArr.length; i++) {
        const svg = new TextDecoder().decode(svgDataArr[i])

        // 将svg转为DOM
        const parser = new DOMParser()
        const svgDOM = parser.parseFromString(svg, 'image/svg+xml')
        const groupCount = svgDOM.getElementById(
          `${iconNameArr[i]}`,
        ).childElementCount

        // 添加 desc描述
        const svgDesc = svgDOM.createElementNS(
          'http://www.w3.org/2000/svg',
          'desc',
        )
        svgDesc.textContent = iconDescArr[i]
        // console.log(svgDesc);

        // 获取SVG元素
        const svgElement = svgDOM.documentElement

        // 检查SVG元素是否存在并正确引用
        if (svgElement != null) {
          // 获取SVG元素的第一个子元素，并将<desc>元素插入到它的前面
          const firstChild = svgElement.firstChild
          svgElement.insertBefore(svgDesc, firstChild)
        } else {
          console.log('未找到SVG元素')
        }

        // 去除根 g标签
        const gToRemove = svgElement.querySelector(`#${iconNameArr[i]}`)

        const gChildren = gToRemove.childNodes

        for (let i = gChildren.length - 1; i >= 0; i--) {
          svgElement.insertBefore(gChildren[i], gToRemove.nextSibling)
        }

        gToRemove.parentNode.removeChild(gToRemove)

        // 去除defs
        const defs = Array.from(svgDOM.getElementsByTagName('defs'))

        if (defs) {
          for (const def of defs) {
            defs[0].parentNode.removeChild(def)
          }
        }

        // 获取 SVG 中 stroke-width 属性的值

        const strokeWidthElement = svgDOM.querySelector('[stroke-width]')

        if (strokeWidthElement !== null) {
          const strokeWidth = strokeWidthElement.getAttribute('stroke-width')
          // 将 stroke-width 属性的值设置为 SVG 元素的属性之一
          svgDOM.querySelector('svg').setAttribute('stroke-width', strokeWidth)
        } else {
          svgDOM.querySelector('svg').setAttribute('stroke-width', '1')
        }

        // 设置group内的fill和stroke
        for (let j = 0; j < groupCount; j++) {
          const svgGroup = svgDOM.getElementById(`group-${[j]}`)
          // 获取group那第一个元素的stroke
          let hexCode = svgDOM
            .getElementById(`group-${[j]}`)
            .firstElementChild.getAttribute('stroke')

          if (hexCode !== null) {
            // console.log(hexCode)
          } else if (hexCode === null) {
            hexCode = svgDOM
              .getElementById(`group-${[j]}`)
              .firstElementChild.getAttribute('fill')
          }
          svgGroup.setAttribute('stroke', hexCode)
          svgGroup.setAttribute('fill', hexCode)

          // 设置group那的图形stroke和fill
          const strokeAttr = svgGroup.querySelectorAll('[stroke]')
          const fillAttr = svgGroup.querySelectorAll('[fill]')
          // console.log(strokeAttr,fillAttr);

          if (strokeAttr.length > 0) {
            for (let i = 0; i < strokeAttr.length; i++) {
              if (strokeAttr[i].getAttribute('stroke') !== null) {
                strokeAttr[i].setAttribute('fill', 'none')
                strokeAttr[i].setAttribute(
                  'vector-effect',
                  'non-scaling-stroke',
                )
                strokeAttr[i].removeAttribute('stroke')
                strokeAttr[i].removeAttribute('stroke-width')
                strokeAttr[i].removeAttribute('id')
              }
            }
          }

          if (fillAttr.length > 0) {
            for (let i = 0; i < fillAttr.length; i++) {
              if (fillAttr[i].getAttribute('fill') !== null) {
                fillAttr[i].setAttribute('stroke', 'none')
                fillAttr[i].removeAttribute('fill')
                fillAttr[i].removeAttribute('id')
              }
            }
          }
        }

        svgString = new XMLSerializer().serializeToString(svgDOM)

        svgString = svgString.replace(/>\s+</g, '><').trim()

        console.log(svgString)

        svgStringArr.push(svgString)

        // if (nodeTypeArr[i] !== 'COMPONENT') {
        //   const error = `<span class='error-info'>获取图层类型错误${nodeTypeArr[i]}</span>`
        //   icon = `<div class='icon-list error-icon' id='${
        //     nodeIDArr[i]
        //   }' tabindex="${[
        //     i,
        //   ]}">\n<div class='icon-wrapper' >${svgString}</div>\n<div class='content-wrapper'><div class='icon-name'>${
        //     iconNameArr[i]
        //   }</div>\n<div id='icon-desc${i}' class='icon-desc'>${error}</div>\n</div>\n</div>`
        // } else if (
        //   nodeTypeArr[i] === 'COMPONENT' &&
        //   iconDescArr[i] === '' &&
        //   svg.match(viewSize) === null
        // ) {
        //   const error = `<span class='error-info'>图标尺寸不正确</span><span class='error-info'>缺失图标描述</span>`
        //   icon = `<div class='icon-list error-icon' id='${
        //     nodeIDArr[i]
        //   }' tabindex="${[
        //     i,
        //   ]}">\n<div class='icon-wrapper'>${svgString}</div>\n<div class='content-wrapper'><div class='icon-name'>${
        //     iconNameArr[i]
        //   }</div>\n<div class='icon-desc'>${error}</div>\n</div>\n</div>`
        // } else if (
        //   nodeTypeArr[i] === 'COMPONENT' &&
        //   svg.match(viewSize) === null
        // ) {
        //   icon = `<div class='icon-list error-icon' id='${
        //     nodeIDArr[i]
        //   }' tabindex="${[
        //     i,
        //   ]}">\n<div class='icon-wrapper'>${svgString}</div>\n<div class='content-wrapper'><div class='icon-name'>${
        //     iconNameArr[i]
        //   }</div>\n<div class='icon-desc'><span class='error-info'>图标尺寸不正确</span>${
        //     iconDescArr[i]
        //   }</div>\n</div>\n</div>`
        // } else if (nodeTypeArr[i] === 'COMPONENT' && iconDescArr[i] === '') {
        //   iconDescArr[i] = `<div class='error-info'>缺失图标描述</div>`
        //   icon = `<div class='icon-list error-icon' id='${
        //     nodeIDArr[i]
        //   }' tabindex="${[
        //     i,
        //   ]}">\n<div class='icon-wrapper'>${svgString}</div>\n<div class='content-wrapper'><div class='icon-name'>${
        //     iconNameArr[i]
        //   }</div>\n<div class='icon-desc'><span class='error-info'>图标尺寸不正确</span>${
        //     iconDescArr[i]
        //   }</div>\n</div>\n</div>`
        // } else {
        //   icon = `<div class='icon-list' id='${nodeIDArr[i]}' tabindex="${[
        //     i,
        //   ]}">\n<div class='icon-wrapper' >${svgString}</div>\n<div class='content-wrapper'><div class='icon-name'>${
        //     iconNameArr[i]
        //   }</div>\n<div id='icon-desc${i}' class='icon-desc'>${
        //     iconDescArr[i]
        //   }</div>\n</div>\n</div>`
        // }

        console.log(typeof svgElement)

        const iconWrap = document.createElement('div')
        iconWrap.appendChild(svgElement)
        iconWrap.classList.add('icon-wrapper')

        const iconItem = document.createElement('div')
        iconItem.appendChild(iconWrap)

        iconItem.classList.add('icon-list')
        iconItem.setAttribute('id', `${nodeIDArr[i]}`)
        iconItem.setAttribute('tabindex', `${[i]}`)

        const contentWrap = document.createElement('div')
        const iconName = document.createElement('div')
        const iconDesc = document.createElement('div')
        iconDesc.classList.add('icon-desc')
        iconDesc.setAttribute('id', `icon-desc${[i]}`)
        iconDesc.textContent = `${iconDescArr[i]}`
        iconName.classList.add('icon-name')

        contentWrap.classList.add('content-wrapper')

        iconName.textContent = `${iconNameArr[i]}`

        contentWrap.appendChild(iconName)
        contentWrap.appendChild(iconDesc)

        iconItem.appendChild(contentWrap)

        console.log(iconDescArr[i])
        console.log()

        const errorMsg = document.createElement('span')
        errorMsg.classList.add('error-info')

        if (
          svgElement.getAttribute('viewBox') !== '0 0 16 16' &&
          iconDescArr[i] === ''
        ) {
          errorMsg.textContent += `图标尺寸不正确; `
          errorMsg.textContent += `缺少图标描述`
        } else if (
          svgElement.getAttribute('viewBox') !== '0 0 16 16' &&
          iconDescArr[i] !== ''
        ) {
          errorMsg.textContent += `图标尺寸不正确`
        }

        contentWrap.appendChild(errorMsg)

        iconList.appendChild(iconItem)
      }

      // console.log(svgStringArr)

      // console.log(iconList);

      count.innerHTML = `<div>已选择</div>\n<div class='badge'>${nodeIDArr.length}</div>`

      const errorCount = Array.from(
        document.getElementsByClassName('error-icon'),
      )

      error.innerHTML = `<div>错误</div>\n<div class='badge badge-red'>${errorCount.length}</div>`

      for (
        let i = 0;
        i < iconList.querySelectorAll('div.icon-list').length;
        i++
      ) {
        const iconItem = iconList.querySelectorAll(
          'div.icon-list',
        ) as unknown as HTMLElement | null
        iconItem[i].onclick = () => {
          console.log('getIconItem')
          const query = iconItem[i].id
          parent.postMessage(
            { pluginMessage: { type: 'storage.select', payload: query } },
            '*',
          )
        }
      }

      const downloadBtn = document.getElementById('downloadBtn')
      if (iconList.innerHTML.indexOf('error-icon') > -1) {
        downloadBtn.setAttribute('disabled', 'disabled')
      }

      if (errorCount.length === 0) {
        error.lastElementChild.classList.remove('badge-red')
      }
    } else if (msg.type === 'no-selection') {
      history.push('/')
    } else if (msg.type === 'download-icon') {
      console.log('received download icon')
      console.log(iconList)
    }
  }

  const onDownload = () => {
    console.log('downloading...')

    // const svgOutArr = [];

    const iconArrOut = Array.from(
      document.getElementsByClassName('icon-wrapper'),
    )
    const iconNameArrOut = Array.from(
      document.getElementsByClassName('icon-name'),
    )
    const svgArr = iconArrOut.map((res) => res.innerHTML)
    const svgNameArr = iconNameArrOut.map((res) => res.innerHTML)
    console.log(svgArr)
    console.log(svgNameArr)

    async function downloadFile(needDownloadList, nameList) {
      const zip = new JSZip()
      const downloadData = zip.folder('icon')
      for (let i = 0; i < needDownloadList.length; i++) {
        const data = needDownloadList[i]
        const blob = new Blob([data], { type: 'image/svg+xml' })
        downloadData.file(`${nameList[i]}.svg`, blob)
      }

      await zip.generateAsync({ type: 'blob' }).then(function (content) {
        FileSaver(content, 'icons')
      })
    }
    downloadFile(svgStringArr, svgNameArr)
  }

  const onError = () => {
    const iconList = Array.from(document.getElementsByClassName('icon-list'))
    for (const icon of iconList) {
      if (!icon.classList.contains('error-icon')) {
        icon.classList.add('hide')
      }
    }
  }

  const onAll = () => {
    const iconList = Array.from(document.getElementsByClassName('icon-list'))
    for (const icon of iconList) {
      if (!icon.classList.contains('error-icon')) {
        icon.classList.remove('hide')
      }
    }
  }

  return (
    <div>
      <div className="content">
        <div className="navbar-wrapper">
          <div className="back-wrapper">
            <Button icon={<ArrowLeftOutlined />} onClick={handleClick}>
              返回
            </Button>
          </div>
          <div className="segment" id="segment-control">
            <div className="segment-unit" id="count" onClick={onAll}></div>
            <div className="segment-unit" id="error" onClick={onError}></div>
          </div>
        </div>
        <div id="list-container"></div>
      </div>
      <div className="footer-wrapper">
        <Button id="downloadBtn" type="primary" onClick={onDownload}>
          下载SVG
        </Button>
      </div>
    </div>
  )
}

export default Result
