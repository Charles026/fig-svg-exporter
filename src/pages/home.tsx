import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { Button } from 'antd'

const Home = () => {
  const history = useHistory()

  const loadIcon = () => {
    console.log('click to load')
    history.push('./result')
    parent.postMessage({ pluginMessage: { type: 'storage.loadIcon' } }, '*')
  }

  useEffect(() => {
    const brandIcon = document.getElementById('brand-icon')

    brandIcon.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none" stroke-width="2.38253"><desc/><g id="KD logo"><g id="group-0" stroke="black" fill="black"><path d="M20.1756 29.7755V5.22394C26.687 5.68889 31.793 11.0246 31.793 17.4997C31.793 23.9749 26.687 29.3106 20.1756 29.7755Z" fill="none" vector-effect="non-scaling-stroke"/><path d="M6.31906 5.19105H16.4722L5.76284 17.9806L4.21478 17.9805V7.42001C4.21478 6.14691 5.19821 5.19105 6.31906 5.19105Z" fill="none" vector-effect="non-scaling-stroke"/><path d="M4.21478 18.0858H5.80926L16.3502 29.8082L6.3401 29.8083C5.13165 29.8083 4.23512 28.8926 4.21513 27.8604L4.21478 27.8186V18.0858Z" fill="none" vector-effect="non-scaling-stroke"/></g></g></svg>'
  }, [])

  return (
    <div>
      <div className="title">
        <div id="brand-icon"></div>
        <h2>KD Icon Exporter</h2>
      </div>
      <div className="load-btn">
        <Button
          block
          style={{ width: '160px' }}
          type="primary"
          onClick={loadIcon}
        >
          加载图标
        </Button>
      </div>
    </div>
  )
}

export default Home
