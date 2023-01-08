import { hot } from 'react-hot-loader/root'
import React from 'react'
import { MemoryRouter as Router, Switch, Route } from 'react-router-dom'
import Home from './home'
import Result from './result'
import '../ui.css'

export default hot(function App() {
  return (
    <div>
      <Router>
        <Switch>
          <Route path="/" exact>
            <Home />
          </Route>
          <Route path="/Result">
            <Result />
          </Route>
        </Switch>
      </Router>
    </div>
  )
})
