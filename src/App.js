import React from 'react';
import './App.scss';
import {
  BrowserRouter,
  Switch,
  Route,
  Link
} from "react-router-dom";
import Board from "./pages/Board";
import Home from "./pages/Home";

export default function App() {
  return(
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/bd/:id" component={Board}/>
      </Switch>
    </BrowserRouter>
  )
}
