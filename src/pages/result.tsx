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

  // let svgDataArr = [];
  // let iconNameArr = [];

  // const segment = document.getElementById('segment-control');

  onmessage = (event) => {
    console.log('receive msg')
    const msg = event.data.pluginMessage
    const svgDataArr = msg.svgDataArr
    const nodeIDArr = msg.nodeIDArr
    const iconNameArr = msg.iconNameArr
    const iconDescArr = msg.iconDescArr
    const nodeTypeArr = msg.nodeTypeArr
    const iconList = document.getElementById('list-container')
    const count = document.getElementById('count')
    const error = document.getElementById('error')
    const iconArr = []
    let icon: string
    const viewSize = `width="16" height="16" viewBox="0 0 16 16"`
    if (msg.type === 'load-icon') {
      for (let i = 0; i < iconNameArr.length; i++) {
        const svg = new TextDecoder().decode(svgDataArr[i])

        // console.log(svg);

        if (nodeTypeArr[i] !== 'COMPONENT') {
          const error = `<span class='error-info'>获取图层类型错误${nodeTypeArr[i]}</span>`
          icon = `<div class='icon-list error-icon' id='${
            nodeIDArr[i]
          }' tabindex="${[
            i,
          ]}">\n<div class='icon-wrapper' >${svg}</div>\n<div class='content-wrapper'><div class='icon-name'>${
            iconNameArr[i]
          }</div>\n<div id='icon-desc${i}' class='icon-desc'>${error}</div>\n</div>\n</div>`
        } else if (
          nodeTypeArr[i] === 'COMPONENT' &&
          iconDescArr[i] === '' &&
          svg.match(viewSize) === null
        ) {
          const error = `<span class='error-info'>图标尺寸不正确</span><span class='error-info'>缺失图标描述</span>`
          icon = `<div class='icon-list error-icon' id='${
            nodeIDArr[i]
          }' tabindex="${[
            i,
          ]}">\n<div class='icon-wrapper'>${svg}</div>\n<div class='content-wrapper'><div class='icon-name'>${
            iconNameArr[i]
          }</div>\n<div class='icon-desc'>${error}</div>\n</div>\n</div>`
        } else if (
          nodeTypeArr[i] === 'COMPONENT' &&
          svg.match(viewSize) === null
        ) {
          icon = `<div class='icon-list error-icon' id='${
            nodeIDArr[i]
          }' tabindex="${[
            i,
          ]}">\n<div class='icon-wrapper'>${svg}</div>\n<div class='content-wrapper'><div class='icon-name'>${
            iconNameArr[i]
          }</div>\n<div class='icon-desc'><span class='error-info'>图标尺寸不正确</span>${
            iconDescArr[i]
          }</div>\n</div>\n</div>`
        } else if (nodeTypeArr[i] === 'COMPONENT' && iconDescArr[i] === '') {
          iconDescArr[i] = `<div class='error-info'>缺失图标描述</div>`
          icon = `<div class='icon-list error-icon' id='${
            nodeIDArr[i]
          }' tabindex="${[
            i,
          ]}">\n<div class='icon-wrapper'>${svg}</div>\n<div class='content-wrapper'><div class='icon-name'>${
            iconNameArr[i]
          }</div>\n<div class='icon-desc'><span class='error-info'>图标尺寸不正确</span>${
            iconDescArr[i]
          }</div>\n</div>\n</div>`
        } else {
          icon = `<div class='icon-list' id='${nodeIDArr[i]}' tabindex="${[
            i,
          ]}">\n<div class='icon-wrapper' >${svg}</div>\n<div class='content-wrapper'><div class='icon-name'>${
            iconNameArr[i]
          }</div>\n<div id='icon-desc${i}' class='icon-desc'>${
            iconDescArr[i]
          }</div>\n</div>\n</div>`
        }

        iconArr.push(icon)
      }
      iconList.innerHTML = iconArr.join('')
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
        console.log(content)
        FileSaver(content, 'icons')
      })
    }
    downloadFile(svgArr, svgNameArr)
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
