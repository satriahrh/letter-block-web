import React from 'react';
import './App.scss';
import {
  BrowserRouter,
  Switch,
  Route,
} from "react-router-dom";
import Board from "./pages/Board";
import Layout from "./components/Layout";
import NewGame from "./pages/NewGame";
import Home from "./pages/Home";
import Heading from "./components/Heading";

export default function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/game/:id" component={Board}/>
        <Layout>
          <Heading/>
          <Switch>
            <Route exact path="/game" component={NewGame}/>
            <Route exact path="/" component={Home}/>
            <Route epath="*">
              <h1>404 Not Found</h1>
            </Route>
          </Switch>
        </Layout>
      </Switch>
    </BrowserRouter>
  )
}
