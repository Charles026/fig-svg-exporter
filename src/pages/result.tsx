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
    //     let svgCodePass = [];
    //     setTimeout(() => {
    //        svgCodePass = svgCodeArr;

    //     function downloadFile(needDownloadList) {
    //     const zip = new JSZip();
    //     const downloadData = zip.folder('icon');
    //     for (let i = 0 ; i < needDownloadList.length; i++) {
    //       const data = needDownloadList[i];
    //       const blob = new Blob([data], { type: "image/svg+xml" }); // 参考前面的单文件下载
    //         downloadData.file(`${[i]}.svg`, blob) // 往文件家里面添加文件
    //     }
    //     zip.generateAsync({type:"blob"}).then(function(content) {
    //     // 保存文件
    //     FileSaver(content, "images");
    //   });
    // };
    // downloadFile(svgCodePass);
    // },100)
  }

  return (
    <div>
      <Button onClick={handleClick}>返回</Button>
    </div>
  )
}

export default Result
