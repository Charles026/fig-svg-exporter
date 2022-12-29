import React from 'react'
// import { useHistory } from 'react-router-dom'
import { Button } from 'antd'

const Home = () => {
  // const history = useHistory()

  const loadIcon = () => {
    // history.push('/about')
    parent.postMessage({ pluginMessage: { type: 'page.loadIcon' } }, '*')
  }

  return (
    <div>
      <h2>Hello Figma Plugin</h2>
      <Button block type="primary" onClick={loadIcon}>
        跳转 About 页
      </Button>
    </div>
  )
}

export default Home
