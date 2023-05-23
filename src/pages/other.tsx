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
    console.log('接收 other 数据 receive msg')
    const msg = event?.data?.pluginMessage || {}
    const svgDataArr = msg?.svgDataArr || []
    const nodeIDArr = msg?.nodeIDArr || []
    const iconNameArr = msg?.iconNameArr || []
    const iconDescArr = msg?.iconDescArr || []
    const nodeTypeArr = msg?.nodeTypeArr || []
    const nodeNameData = msg?.nodeNameData || []
    const iconList = document.getElementById('list-container')
    const count = document.getElementById('count')
    const error = document.getElementById('error')

    if (msg.type === 'load-icon') {
      for (let i = 0; i < iconNameArr.length; i++) {
        const svg = new TextDecoder().decode(svgDataArr[i])
        // log svg
        // console.log(svg)
        // 将svg转为DOM
        const parser = new DOMParser()
        const svgDOM = parser.parseFromString(svg, 'image/svg+xml')

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

        // console.log(nodeNameData[i].id)

        // 去除根 g标签
        const gToRemove = svgDOM.querySelector(`#${iconNameArr[i]}`)
        console.log(gToRemove)

        if (gToRemove !== null) {
          const gChildren = gToRemove.childNodes
          for (let i = gChildren.length - 1; i >= 0; i--) {
            svgElement.insertBefore(gChildren[i], gToRemove.nextSibling)
          }
          gToRemove.parentNode.removeChild(gToRemove)
        }

        // log svg
        console.log('输出svgElement', svgElement)

        // 去除defs
        // const defs = Array.from(svgDOM.getElementsByTagName('defs'))

        // if (defs) {
        //   for (const def of defs) {
        //     defs[0].parentNode.removeChild(def)
        //   }
        // }

        svgString = new XMLSerializer().serializeToString(svgDOM)

        svgString = svgString.replace(/>\s+</g, '><').trim()

        console.log(svgString)

        svgStringArr.push(svgString)

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

        iconName.classList.add('icon-name')

        contentWrap.classList.add('content-wrapper')

        iconName.textContent = `${iconNameArr[i]}`

        contentWrap.appendChild(iconName)

        if (iconDescArr[i] !== '' && iconDescArr[i] !== undefined) {
          iconDesc.textContent = `${iconDescArr[i]}`
          contentWrap.appendChild(iconDesc)
        }

        iconItem.appendChild(contentWrap)

        const errorMsg = document.createElement('span')
        errorMsg.classList.add('error-info')

        if (iconDescArr[i] === undefined) {
          errorMsg.textContent += `图层类型错误: ${nodeTypeArr[i]}; `
        } else if (iconDescArr[i] === '') {
          errorMsg.textContent += `缺少图标描述; `
        }
        console.log('输出名字', nodeNameData)

        contentWrap.appendChild(errorMsg)

        if (iconDescArr[i] === '' || iconDescArr[i] === undefined) {
          iconItem.classList.add('error-icon')
        }

        iconList.appendChild(iconItem)
      }

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
            { pluginMessage: { type: 'page.select', payload: query } },
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
    // console.log(svgNameArr)

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
