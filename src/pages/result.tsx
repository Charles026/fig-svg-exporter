import React from 'react'
import { useHistory } from 'react-router-dom'
// import JSZip from "jszip";
// import FileSaver from 'file-saver';
import { Button } from 'antd'

const Result = () => {
  const history = useHistory()

  const handleClick = () => {
    history.push('/')
  }
  const svgCodeArr = []
  let svgCode: string
  onmessage = (event) => {
    const msg = event.data.pluginMessage
    if (msg.type === 'icon-data') {
      svgCode = new TextDecoder().decode(msg.svgData)
    }
    svgCodeArr.push(svgCode)
    console.log(svgCodeArr)
  }

  return (
    <div>
      <Button onClick={handleClick}>返回</Button>
    </div>
  )
}

export default Result
