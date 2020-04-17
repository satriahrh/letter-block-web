import React from 'react';
import './App.scss';
import {
  BrowserRouter,
  Switch,
  Route,
  Link
} from "react-router-dom";
import Board from "./pages/Board";
import NewGame from "./pages/NewGame";

export default function App() {
  return(
    <BrowserRouter>
      <Switch>
        <Route exact path="/game" component={NewGame} />
        <Route path="/game/:id" component={Board}/>
      </Switch>
    </BrowserRouter>
  )
}
