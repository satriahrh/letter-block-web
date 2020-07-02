import React, { useContext, useState } from "react";
import { useParams } from "react-router";
import gql from "graphql-tag";
import { useMutation, useQuery, useSubscription } from "@apollo/react-hooks";

import module from "./Game.module.scss";
import Layout from "../components/Layout";
import Heading from "../components/Heading";
import BoardWordHistory from "../components/BoardWordHistory";
import { UserContext } from "../contexts/user";

const BOX_COLOR = [
  ["#e0e0e0"], // no owner
  ["#ff9999", "#ff0000"],
  ["#ccdcff", "#0152ff"],
  ["#fbfecc", "#ecfb00"],
  ["#ffccfc", "#ffccfc"],
  ["#d0fecc", "#18fb03"],
];
const ALPHABET = " ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const GET_GAME = gql`
  query GetGame($gameId: ID!) {
    getGame(gameId: $gameId) {
      id
      boardBase
      boardPositioning
      wordPlayed {
        player {
          id
          username
        }
        word
      }
      players {
        id
        username
      }
      currentPlayerOrder
      numberOfPlayer
    }
  }
`;
const TAKE_TURN = gql`
  mutation TakeTurn($gameId: ID!, $word: [Int!]!) {
    takeTurn(input: { gameId: $gameId, word: $word }) {
      id
    }
  }
`;

const JOIN_GAME = gql`
  mutation JoinGame($gameId: ID!) {
    joinGame(input: { gameId: $gameId }) {
      id
    }
  }
`;

const LISTEN_GAME = gql`
  subscription ListenGame($gameId: ID!) {
    listenGame(gameId: $gameId) {
      id
      currentPlayerOrder
      players {
        id
        username
      }
      wordPlayed {
        word
      }
      boardBase
      boardPositioning
      numberOfPlayer
    }
  }
`;

function currentPlayerColor(currentPlayerOrder) {
  return BOX_COLOR[currentPlayerOrder + 1][1];
}

function currentPlayer(currentPlayerOrder, players, user) {
  if (players[currentPlayerOrder]) {
    const currentPlayer = players[currentPlayerOrder];
    if (currentPlayer.id === user.playerId) {
      return "kamu";
    } else {
      return currentPlayer.username;
    }
  } else {
    return "ga tau, nunggu pemain lain gabung";
  }
}

function processWord(wordArray, boardBase) {
  let result = "";
  for (let i = 0; i < wordArray.length; i++) {
    result += ALPHABET[boardBase[wordArray[i]]];
  }
  return result;
}

function ownerOfThisBase(position, numberOfPlayer) {
  return position % (numberOfPlayer + 1);
}

function strengthOfThisBase(position, numberOfPlayer) {
  return Math.floor(position / (numberOfPlayer + 2));
}

function Game() {
  let { gameId } = useParams();

  const user = useContext(UserContext);

  const [state, setState] = useState({
    wordArray: [],
    boxActive: Array(25).fill(true),
  });

  useSubscription(LISTEN_GAME, {
    variables: { gameId: gameId },
    onSubscriptionData: (options) => {
      const data = options.subscriptionData.data.listenGame;
      setState((prevState) => ({
        ...prevState,
        game: {
          currentPlayerOrder: data.currentPlayerOrder,
          players: data.players,
          numberOfPlayer: data.numberOfPlayer,
          boardBase: data.boardBase,
          boardPositioning: data.boardPositioning,
          wordPlayeds: data.wordPlayed,
        },
      }));
    },
  });

  const [joinGame] = useMutation(JOIN_GAME, {
    onError: (error) => {
      alert(error.message);
    },
    onCompleted: (data) => {
      getGameData.refetch();
    },
  });

  const getGameData = useQuery(GET_GAME, {
    fetchPolicy: "cache-and-network",
    variables: { gameId },
    onCompleted: (data) => {
      setState((prevState) => ({
        ...prevState,
        game: {
          currentPlayerOrder: data.getGame.currentPlayerOrder,
          players: data.getGame.players,
          numberOfPlayer: data.getGame.numberOfPlayer,
          boardBase: data.getGame.boardBase,
          boardPositioning: data.getGame.boardPositioning,
          wordPlayeds: data.getGame.wordPlayed,
        },
      }));
    },
    onError: error => {
      alert(error.message)
    }
  });

  const [takeTurn] = useMutation(TAKE_TURN, {
    onError: (error) => {
      setState((prevState) => ({
        ...prevState,
        sendActive: true,
        boxActive: Array(25).fill(true),
      }));
      alert(error.message);
    },
    onCompleted: (data) => {
      setState((prevState) => ({
        ...prevState,
        sendActive: true,
        boxActive: Array(25).fill(true),
      }));
      getGameData.refetch();
    },
  });

  if (getGameData.error) {
    return (
      <Layout>
        <h1>Something is wrong</h1>
        <p>{getGameData.error.message}</p>
      </Layout>
    );
  }

  if (getGameData.loading) {
    return <p>Wait a minute</p>;
  }

  if (!state.game) {
    return <p>Please wait</p>;
  }

  let playerColors = new Map();
  let playerOfThisGame = false;
  state.game.players.forEach((player, id) => {
    playerColors.set(player.id, BOX_COLOR[id + 1][1]);
    if (player.id === user.playerId) {
      playerOfThisGame = true;
    }
  });

  if (!playerOfThisGame && state.sendActive) {
    setState((prevState) => ({
      ...prevState,
      sendActive: false,
    }));
  }

  const rightNavigation = (() => {
    if (playerOfThisGame) {
      return (
        <button
          className={module.nav}
          onClick={(e) => {
            setState((prevState) => ({
              ...prevState,
              // game: null,
              sendActive: false,
              wordArray: [],
            }));
            takeTurn({
              variables: { gameId: gameId, word: state.wordArray },
            }).catch((e) => alert(e));
          }}
          disabled={!state.sendActive}
          hidden={playerOfThisGame}
        >
          SEND
        </button>
      );
    } else {
      return (
        <button
          className={module.nav}
          onClick={(e) => {
            console.log(gameId);
            joinGame({ variables: { gameId: gameId } });
          }}
        >
          Join the Game
        </button>
      );
    }
  })();

  return (
    <div className={module.board}>
      <Heading>
        <p style={{ margin: "0" }}>
          giliran{" "}
          <span
            style={{ color: currentPlayerColor(state.game.currentPlayerOrder) }}
          >
            {currentPlayer(
              state.game.currentPlayerOrder,
              state.game.players,
              user
            )}
          </span>
        </p>
      </Heading>
      <div className={module.word}>
        <p>{processWord(state.wordArray, state.game.boardBase)}</p>
      </div>
      <div className={module.base}>
        <button
          className={module.nav}
          onClick={(e) => {
            setState((prevState) => ({
              ...prevState,
              wordArray: [],
              sendActive: false,
              boxActive: Array(25).fill(true),
            }));
          }}
        >
          RESET
        </button>
        {rightNavigation}
        {[...Array(25).keys()].map((i) => (
          <button
            className={module.box}
            key={i}
            id={i}
            onClick={(e) => {
              let id = e.currentTarget.id;
              setState((prevState) => {
                let newWordArray = [].concat(state.wordArray, id);
                let newBoxActive = prevState.boxActive;
                newBoxActive[i] = false;
                return {
                  ...prevState,
                  wordArray: newWordArray,
                  sendActive: newWordArray.length >= 3,
                  boxActive: newBoxActive,
                };
              });
            }}
            style={{
              backgroundColor:
                BOX_COLOR[
                  ownerOfThisBase(
                    state.game.boardPositioning[i],
                    state.game.numberOfPlayer
                  )
                ][
                  strengthOfThisBase(
                    state.game.boardPositioning[i],
                    state.game.numberOfPlayer
                  )
                ],
            }}
            disabled={!state.boxActive[i]}
          >
            {ALPHABET[state.game.boardBase[i]]}
          </button>
        ))}
      </div>
      <Layout>
        <pre>letter-block.herokuapp.com/game/{gameId}</pre>
        <BoardWordHistory
          wordPlayeds={state.game.wordPlayeds}
          playerColors={playerColors}
        />
      </Layout>
    </div>
  );
}

export default Game;
