import React from 'react';
import {BrowserRouter, Route, Switch} from "react-router-dom";
import Heading from "../components/Heading";

import module from "./Dasboard.module.scss"
import NewGame from "./NewGame";
import Home from "./Home";

export default function Dashboard() {
  return (
    <BrowserRouter>
      <div className={module.dashboard}>
        <Heading/>
        <div className={module.layout}>
          <Switch>
            <Route exact path="/game" component={NewGame}/>
            <Route exact path="/" component={Home}/>
            <Route path="*">
              <h1>404 Not Found</h1>
            </Route>
          </Switch>
        </div>
      </div>
    </BrowserRouter>
  )
}