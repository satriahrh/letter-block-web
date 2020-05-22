import React, {useState} from 'react';
import {useParams} from 'react-router';
import gql from 'graphql-tag';
import {useMutation, useQuery, useSubscription} from '@apollo/react-hooks';

import module from './Game.module.scss'
import Layout from "../components/Layout";
import Heading from "../components/Heading";
import BoardWordHistory from "../components/BoardWordHistory";

const BOX_COLOR = [
  ['#e0e0e0'], // no owner
  ['#ff9999', '#ff0000'],
  ['#ccdcff', '#0152ff'],
  ['#fbfecc', '#ecfb00'],
  ['#ffccfc', '#ffccfc'],
  ['#d0fecc', '#18fb03'],
];
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const GET_GAME = gql`
  query GetGame($gameId: ID!) {
    getGame(gameId: $gameId) {
      id
      boardBase
      boardPositioning
      wordPlayed {
        player {
          id
        }
        word
      }
      players {
        id
      }
      currentPlayerOrder
      numberOfPlayer
    }
  }
`;
const TAKE_TURN = gql`
  mutation TakeTurn($gameId: ID!, $word: [Int!]!) {
    takeTurn(input: {gameId: $gameId, word: $word}) {
      id
    }
  }
`;

const JOIN_GAME = gql`
  mutation JoinGame($gameId: ID!) {
    joinGame(input:{gameId: $gameId, playerId: "1"}) {
      id
    }
  }
`;

const LISTEN_GAME = gql`
  subscription ListenGame($gameId: ID!){
    listenGame(gameId: $gameId) {
      id
      currentPlayerOrder
      players{
        id
      }
      wordPlayed {
        word
      }
      boardBase
      boardPositioning
      numberOfPlayer
    }
  }
`

function currentPlayerColor(currentPlayerOrder) {
  return BOX_COLOR[currentPlayerOrder + 1][1]
}

function currentPlayer(currentPlayerOrder, players) {
  if (players[currentPlayerOrder]) {
    return players[currentPlayerOrder].id
  } else {
    return 'waiting for new player'
  }
}

function processWord(wordArray, boardBase) {
  let result = "";
  for (let i = 0; i < wordArray.length; i++) {
    result += ALPHABET[boardBase[wordArray[i]]]
  }
  return result
}

function ownerOfThisBase(position, numberOfPlayer) {
  return position % (numberOfPlayer + 1)
}

function strengthOfThisBase(position, numberOfPlayer) {
  return Math.floor(position / (numberOfPlayer + 2))
}

function Game() {
  let {gameId} = useParams();

  const [state, setState] = useState({
    wordArray: [],
    boxActive: Array(25).fill(true)
  });

  useSubscription(LISTEN_GAME, {
    variables: {gameId: gameId},
    onSubscriptionData: options => {
      const data = options.subscriptionData.data.listenGame;
      setState(prevState => ({
        ...prevState,
        game: {
          currentPlayerOrder: data.currentPlayerOrder,
          players: data.players,
          numberOfPlayer: data.numberOfPlayer,
          boardBase: data.boardBase,
          boardPositioning: data.boardPositioning,
          wordPlayeds: data.wordPlayed
        }
      }))
    }
  });

  const [joinGame] = useMutation(JOIN_GAME, {
    onError: error => {
      alert(error.graphQLErrors[0].message)
    },
    onCompleted: data => {
      getGameData.refetch()
    }
  });

  const getGameData = useQuery(GET_GAME, {
    fetchPolicy: 'cache-and-network',
    variables: {gameId},
    onCompleted: data => {
      setState(prevState => ({
        ...prevState,
        game: {
          currentPlayerOrder: data.getGame.currentPlayerOrder,
          players: data.getGame.players,
          numberOfPlayer: data.getGame.numberOfPlayer,
          boardBase: data.getGame.boardBase,
          boardPositioning: data.getGame.boardPositioning,
          wordPlayeds: data.getGame.wordPlayed
        }
      }))
    }
  });

  const [takeTurn] = useMutation(TAKE_TURN, {
    onError: error => {
      setState(prevState => ({
        ...prevState,
        sendActive: true,
        boxActive: Array(25).fill(true),
      }));
      alert(error.graphQLErrors[0].message);
    },
    onCompleted: data => {
      setState(prevState => ({
        ...prevState,
        sendActive: true,
        boxActive: Array(25).fill(true),
      }));
      getGameData.refetch()
    }
  });

  if (getGameData.error) {
    if (getGameData.error.graphQLErrors[0].message === 'player is not authorized') {
      return (
        <Layout>
          <h2>Would you like to join the game?</h2>
          <button
            className={module.nav}
            onClick={e => {
              joinGame({variables: {gameId: gameId}});
            }}
          >
            Join the Game
          </button>
        </Layout>
      )
    }
    return (
      <Layout>
        <h1>Something is wrong</h1>
        <p>{getGameData.error.graphQLErrors[0].message}</p>
      </Layout>
    )
  }

  if (getGameData.loading) {
    return <p>Wait a minute</p>
  }

  if (!state.game) {
    return <p>Please wait</p>
  }

  let playerColors = new Map();
  state.game.players.forEach((player, id) => {
    playerColors.set(player.id, BOX_COLOR[id + 1][1])
  });

  return (
    <div className={module.board}>
      <Heading>
        <p style={{margin: "0"}}>
          <span
            style={{color: currentPlayerColor(state.game.currentPlayerOrder)}}
          >{currentPlayer(state.game.currentPlayerOrder, state.game.players)}</span>'s
          turn
        </p>
      </Heading>
      <div className={module.word}>
        <p>{processWord(state.wordArray, state.game.boardBase)}</p>
      </div>
      <div className={module.base}>
        <button
          className={module.nav}
          onClick={e => {
            setState(prevState => ({
              ...prevState,
              wordArray: [],
              sendActive: false,
              boxActive: Array(25).fill(true),
            }));
          }}
        >
          RESET
        </button>
        <button
          className={module.nav}
          onClick={e => {
            setState(prevState => ({
              ...prevState,
              // game: null,
              sendActive: false,
              wordArray: [],
            }));
            takeTurn({variables: {gameId: gameId, word: state.wordArray}}).catch(e => alert(e))
          }}
          disabled={!state.sendActive}
        >
          SEND
        </button>
        {
          [...Array(25).keys()].map(i => (
            <button
              className={module.box} key={i} id={i}
              onClick={e => {
                let id = e.currentTarget.id;
                setState(prevState => {
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
                backgroundColor: BOX_COLOR[
                  ownerOfThisBase(state.game.boardPositioning[i], state.game.numberOfPlayer)
                  ][
                  strengthOfThisBase(state.game.boardPositioning[i], state.game.numberOfPlayer)
                  ],
              }}
              disabled={!state.boxActive[i]}
            >
              {ALPHABET[state.game.boardBase[i]]}
            </button>
          ))
        }
      </div>
      <Layout>
        <pre>letter-block.game/bd/{gameId}</pre>
        <BoardWordHistory wordPlayeds={state.game.wordPlayeds} playerColors={playerColors}/>
      </Layout>
    </div>
  )
}

export default Game