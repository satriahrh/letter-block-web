import React, { useState } from "react";
import "./App.scss";
import { BrowserRouter, Switch, Route } from "react-router-dom";
// import Board from "./pages/Board";
import Layout from "./components/Layout";
import NewGame from "./pages/NewGame";
import Home from "./pages/Home";
import Heading from "./components/Heading";
import Fingerprint2 from "fingerprintjs2";
import { ApolloProvider } from "@apollo/react-hooks";
import ApolloClient from "apollo-boost";
import { InMemoryCache } from "apollo-cache-inmemory";
import caseConverter from "case-converter";
import Game from "./pages/Game";
import { UserContextProvider } from "./contexts/user";
import { LoadingBlock } from "./components/Loading";

const DEVICE_FINGERPRINT = "deviceFingerprint";
const ACCESS_TOKEN = "accessToken";
const cache = new InMemoryCache();

async function deviceFingerprintGeneration() {
  let deviceFingerprint = localStorage.getItem(DEVICE_FINGERPRINT);
  if (deviceFingerprint) {
    return deviceFingerprint;
  }
  if (deviceFingerprint) {
    return deviceFingerprint;
  }

  // let a = new Uint32Array(20);
  // a.fill(3)
  // const typedArray = crypto.getRandomValues(a);

  const rawFingerprint = await (() => {
    return new Promise((resolve) => {
      if (window.requestIdleCallback) {
        requestIdleCallback(function () {
          Fingerprint2.get(function (components) {
            resolve(components);
          });
        });
      } else {
        setTimeout(function () {
          Fingerprint2.get(function (components) {
            resolve(components);
          });
        }, 500);
      }
    });
  })();
  const strFingerprint = JSON.stringify(rawFingerprint);
  let encodedPlayerFingerprint = new TextEncoder().encode(strFingerprint);
  let buf = await crypto.subtle.digest("SHA-512", encodedPlayerFingerprint);
  const typedArray = Array.from(new Uint8Array(buf));
  deviceFingerprint = typedArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  localStorage.setItem(DEVICE_FINGERPRINT, deviceFingerprint);
  return deviceFingerprint;
}

function App() {
  const [state, setState] = useState({
    accessToken: JSON.parse(localStorage.getItem(ACCESS_TOKEN)),
    deviceFingerprint: localStorage.getItem(DEVICE_FINGERPRINT),
    loading: true,
  });

  const register = async (username, deviceFingerprint) => {
    let form = new FormData();
    form.append("username", username);
    form.append("deviceFingerprint", deviceFingerprint);

    await fetch(process.env.REACT_APP_API_URL_REGISTER, {
      method: "POST",
      body: form,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("registered");
      })
      .catch((reason) => {
        alert(reason);
      });
  };

  const authentication = async (deviceFingerprint) => {
    let form = new FormData();
    form.append("deviceFingerprint", deviceFingerprint);

    let response = await fetch(process.env.REACT_APP_API_URL_AUTHENTICATE, {
      method: "POST",
      body: form,
    })
      .then((response) => {
        if (response.status !== 200) {
          setState(prevState => ({
            ...prevState,
            deviceFingerprint: null,
          }));
          return { data: { token: "", expiredIn: 5 } }
        }
        return response.json();
      })
      .then((data) => {
        return data;
      })
      .catch((reason) => {
        alert(reason)
        return { data: { token: "", expiredIn: 5 } };
      });

    response = caseConverter.toCamelCase(response);
    let expiredIn = response.data.expiredIn;
    console.log(expiredIn);
    let time = new Date();
    response.data.expiredAt = expiredIn * 1000 + time.getTime();
    localStorage.setItem(ACCESS_TOKEN, JSON.stringify(response.data));

    setState((prevState) => ({
      ...prevState,
      accessToken: response.data,
    }));
  };

  if (!state.deviceFingerprint) {
    return (
      <Layout>
        <h1>Daftar!</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            let username = document.getElementById("input_username").value;
            deviceFingerprintGeneration().then((deviceFingerprint) => {
              register(username, deviceFingerprint).then(() => {
                authentication(deviceFingerprint).then();
              });
              setState((prevState) => ({
                ...prevState,
                deviceFingerprint: deviceFingerprint,
              }));
            });
          }}
        >
          <div>
            <label>Nama Pengguna: </label>
            <input id={"input_username"} type="string" placeholder="John Doe" />
          </div>
          <input type="submit" value="Daftar" />
        </form>
      </Layout>
    );
  } else {
    if (state.accessToken) {
      let time = new Date();
      if (time.getTime() >= state.accessToken.expiredAt) {
        authentication(state.deviceFingerprint).then();
      } else if (!state.graphqlClient) {
        setState((prevState) => ({
          ...prevState,
          graphqlClient: new ApolloClient({
            cache: cache,
            uri: process.env.REACT_APP_API_URL_GRAPHQL,
            headers: {
              Authorization: `Bearer ${state.accessToken.token}`,
            },
          }),
          loading: false,
        }));
      }
    }
  }

  if (state.loading) {
    return <LoadingBlock />;
  }

  return (
    <ApolloProvider client={state.graphqlClient}>
      <UserContextProvider>
        <BrowserRouter>
          <Switch>
            <Route exact path="/game/:gameId" component={Game} />
            {/*<Route exact path="/game/:gameId" component={Board}/>*/}
            <Layout>
              <Heading />
              <Switch>
                <Route exact path="/game" component={NewGame} />
                <Route exact path="/" component={Home} />
                }/>
                <Route epath="*">
                  <h1>404 Not Found</h1>
                </Route>
              </Switch>
            </Layout>
          </Switch>
        </BrowserRouter>
      </UserContextProvider>
    </ApolloProvider>
  );
}

export default App;
