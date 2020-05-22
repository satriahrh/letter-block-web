import React from 'react';
import './App.scss';
import {
  BrowserRouter,
  Switch,
  Route,
} from "react-router-dom";
// import Board from "./pages/Board";
import Layout from "./components/Layout";
import NewGame from "./pages/NewGame";
import Home from "./pages/Home";
import Heading from "./components/Heading";
import Fingerprint2 from 'fingerprintjs2';
import {ApolloProvider} from '@apollo/react-hooks';
import ApolloClient from 'apollo-boost';
import {InMemoryCache} from 'apollo-cache-inmemory';
import caseConverter from 'case-converter'
import Game from "./pages/Game";

const DEVICE_FINGERPRINT = "deviceFingerprint";
const ACCESS_TOKEN = "accessToken";
const cache = new InMemoryCache();

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    }
  }

  componentDidMount() {
    if (this.state.loading) {
      this.graphqlClientGeneration()
    }
  }

  async graphqlClientGeneration() {
    let token = await this.tokenGeneration();
    const graphqlClient = new ApolloClient({
      cache: cache,
      uri: 'http://192.168.43.93:8080/query',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    this.setState((prevState) => ({
      ...prevState,
      graphqlClient: graphqlClient,
      loading: false,
    }));
  }

  async tokenGeneration() {
    let accessToken = localStorage.getItem(ACCESS_TOKEN);
    if (accessToken) {
      accessToken = JSON.parse(accessToken);
      let time = new Date();
      if (time.getTime() < accessToken.expiredAt) {
        return accessToken.token
      }
    }
    let deviceFingerprint = await this.deviceFingerprintGeneration();
    let form = new FormData();
    form.append("deviceFingerprint", deviceFingerprint);

    let response = await fetch('http://192.168.43.93:8080/authenticate', {
      method: 'POST',
      body: form,
    }).then(response => response.json()).then(data => {
      return data
    }).catch(reason => {
      console.log(reason)
      return {token: "", expiredIn: 0}
    });

    response = caseConverter.toCamelCase(response);
    let time = new Date();
    response.data.expiredAt = response.data.expiredIn * 1000 + time.getTime();
    localStorage.setItem(ACCESS_TOKEN, JSON.stringify(response.data));
    return response.data.token
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

  async deviceFingerprintGeneration() {
    let deviceFingerprint = localStorage.getItem(DEVICE_FINGERPRINT);
    if (deviceFingerprint) {
      return deviceFingerprint
    }

    // let a = new Uint32Array(20);
    // a.fill(3)
    // const typedArray = crypto.getRandomValues(a);

    let rawFingerprint = await this.generateFingerprint();
    let encodedPlayerFingerprint = new TextEncoder().encode(rawFingerprint.toString());
    let buf = await crypto.subtle.digest("SHA-512", encodedPlayerFingerprint);
    const typedArray = Array.from(new Uint8Array(buf));
    deviceFingerprint = typedArray.map(b => b.toString(16).padStart(2, '0')).join('');

    localStorage.setItem(DEVICE_FINGERPRINT, deviceFingerprint);
    return deviceFingerprint
  }

  render() {
    if (this.state.loading) {
      return <p>
        Please Wait
      </p>
    }
    return (
      <ApolloProvider client={this.state.graphqlClient}>
        <BrowserRouter>
          <Switch>
            <Route exact path="/game/:gameId" component={Game}/>
            {/*<Route exact path="/game/:gameId" component={Board}/>*/}
            <Layout>
              <Heading/>
              <Switch>
                <Route exact path="/game" component={NewGame}/>
                <Route exact path="/" component={Home}/>}/>
                <Route epath="*">
                  <h1>404 Not Found</h1>
                </Route>
              </Switch>
            </Layout>
          </Switch>
        </BrowserRouter>
      </ApolloProvider>
    )
  }
}

export default App
