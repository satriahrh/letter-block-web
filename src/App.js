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
import {ApolloProvider} from '@apollo/react-hooks';
import ApolloClient from 'apollo-boost';
// import {createHttpLink} from 'apollo-link-http';
// import {setContext} from 'apollo-link-context';
import caseConverter from 'case-converter'

const DEVICE_FINGERPRINT = "deviceFingerprint";
const ACCESS_TOKEN = "accessToken";

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
    // const httpLink = createHttpLink({
    //   uri: 'http://localhost:8080/query',
    // });

    let token = await this.tokenGeneration();

    // const authLink = setContext((_, {headers}) => {
    //   return {
    //     headers: {
    //       ...headers,
    //       authorization: token ? `Bearer ${token}` : "",
    //     }
    //   }
    // });

    const graphqlClient = new ApolloClient({
      uri: 'http://localhost:8080/query',
      headers: {
        Authorization: `Bearer ${token}`,
      }
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
      accessToken = JSON.parse(accessToken)
      let time = new Date()
      if (time.getTime() < accessToken.expiredAt) {
        console.log(accessToken.token)
        return accessToken.token
      }
    }
    let deviceFingerprint = await this.deviceFingerprintGeneration()
    let form = new FormData();
    form.append("deviceFingerprint", deviceFingerprint);

    let response = await fetch('http://localhost:8080/authenticate', {
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
    let rawFingerprint = await this.generateFingerprint();

    let encodedPlayerFingerprint = new TextEncoder().encode(rawFingerprint.toString());
    let buf = await crypto.subtle.digest("SHA-512", encodedPlayerFingerprint);
    const playerIdArray = Array.from(new Uint8Array(buf));
    deviceFingerprint = playerIdArray.map(b => b.toString(16).padStart(2, '0')).join('');

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
      </ApolloProvider>
    )
  }
}

export default App
