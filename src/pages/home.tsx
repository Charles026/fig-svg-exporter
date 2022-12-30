import React from 'react'
import { useHistory } from 'react-router-dom'
import { Button } from 'antd'

const Home = () => {
  const history = useHistory()

  const loadIcon = () => {
    history.push('/result')
    parent.postMessage({ pluginMessage: { type: 'page.loadIcon' } }, '*')
  }

  return (
    <div>
      <h2>KD Icon Exporter</h2>
      <Button block type="primary" onClick={loadIcon}>
        加载图标
      </Button>
    </div>
  )
}

export default Home
