import React from 'react';
import './App.scss';
import {
  BrowserRouter,
  Switch,
  Route,
} from "react-router-dom";
import Board from "./pages/Board";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return(
    <BrowserRouter>
      <Switch>
        <Route exact path="/game/:id" component={Board}/>
        <Route exact path="/*" component={Dashboard}/>
      </Switch>
    </BrowserRouter>
  )
}
