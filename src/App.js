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
import Fingerprint2 from 'fingerprintjs2';

const PLAYER_ID_KEY = "playerId";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  componentDidMount() {
    if (!this.state.playerId) {
      this.playerIdGeneration()
    }
  }

  generateFingerprint() {
    return new Promise((resolve) => {
      if (window.requestIdleCallback) {
        requestIdleCallback(function () {
          Fingerprint2.get(function (components) {
            resolve(components);
          })
        })
      } else {
        setTimeout(function () {
          Fingerprint2.get(function (components) {
            resolve(components);
          })
        }, 500)
      }
    })
  }

  async playerIdGeneration() {
    let playerId = localStorage.getItem(PLAYER_ID_KEY);
    if (!playerId) {
      let playerFingerprint = await this.generateFingerprint();

      let encodedPlayerFingerprint = new TextEncoder().encode(playerFingerprint.toString());
      let playerIdBuffer = await crypto.subtle.digest("SHA-512", encodedPlayerFingerprint);
      const playerIdArray = Array.from(new Uint8Array(playerIdBuffer));
      const playerId = playerIdArray.map(b => b.toString(16).padStart(2, '0')).join('');

      localStorage.setItem(PLAYER_ID_KEY, playerId);
    }
    this.setState((prevState) => ({
      ...prevState,
      playerId: playerId,
    }));
  }

  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/game/:id" component={() => <Board playerId={this.state.playerId}/>}/>
          <Layout>
            <Heading/>
            <Switch>
              <Route exact path="/game" component={() => <NewGame playerId={this.state.playerId}/>}/>
              <Route exact path="/" component={() => <Home playerId={this.state.playerId}/>}/>
              <Route epath="*">
                <h1>404 Not Found</h1>
              </Route>
            </Switch>
          </Layout>
        </Switch>
      </BrowserRouter>
    )
  }
}

export default App
