import React, {useState} from 'react';
import {useParams} from 'react-router';
import gql from 'graphql-tag';
import {useQuery} from '@apollo/react-hooks';

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
let boxRef = [];
let sendRef = null;

function currentPlayerColor(currentPlayerOrder) {
  return BOX_COLOR[currentPlayerOrder + 1][1]
}

function currentPlayer(currentPlayerOrder, players) {
  return players[currentPlayerOrder].id
}

function processWord(wordArray, boardBase) {
  let result = "";
  for (let i = 0; i < wordArray.length; i++) {
    result += ALPHABET[boardBase[wordArray[i]]]
  }
  return result
}

function ownerOfThisBase(position, numberOfPlayer) {
  if (position === 0) {
    return 0
  }
  return position / (numberOfPlayer + 2)
}

function strengthOfThisBase(position, numberOfPlayer) {
  return position % (numberOfPlayer + 1)
}

function Game() {
  let {gameId} = useParams();

  const [state, setState] = useState({
    wordArray: []
  });

  const {loading, error, data} = useQuery(GET_GAME, {variables: {gameId}});

  if (loading) {
    return <p>Wait a minute</p>
  }
  if (error) {
    console.log(error)
    return (
      <Layout>
        <h1>Something is wrong</h1>
        <p>{error}</p>
      </Layout>
    )
  }
  let game = {};
  if (data) {
    game = {
      currentPlayerOrder: data.getGame.currentPlayerOrder,
      players: data.getGame.players,
      numberOfPlayer: data.getGame.numberOfPlayer,
      boardBase: data.getGame.boardBase,
      boardPositioning: data.getGame.boardPositioning,
      wordPlayeds: data.getGame.wordPlayed
    }
  }

  let playerColors = new Map();
  game.players.forEach((player, id) => {
    playerColors.set(player.id, BOX_COLOR[id + 1][1])
  });

  return (
    <div className={module.board}>
      <Heading>
        <p style={{margin: "0"}}>
          <span
            style={{color: currentPlayerColor(game.currentPlayerOrder)}}
          >{currentPlayer(game.currentPlayerOrder, game.players)}</span>'s
          turn
        </p>
      </Heading>
      <div className={module.word}>
        <p>{processWord(state.wordArray, game.boardBase)}</p>
      </div>
      <div className={module.base}>
        <button
          className={module.nav}
          onClick={e => {
            state.wordArray.forEach(i => {
              boxRef[i].disabled = false
            });
            sendRef.disabled = true;

            setState(prevState => ({
              ...prevState,
              wordArray: [],
            }));
          }}
        >
          RESET
        </button>
        <button
          className={module.nav} disabled={true}
          ref={r => sendRef = r}
        >
          SEND
        </button>
        {
          [...Array(25).keys()].map(i => (
            <button
              className={module.box} key={i} id={i}
              ref={r => boxRef[i] = r}
              onClick={e => {
                let id = e.currentTarget.id;
                setState(prevState => {
                  let newWordArray = [].concat(state.wordArray, id);
                  if (newWordArray.length >= 3) {
                    sendRef.disabled = false
                  }
                  return {
                    ...prevState,
                    wordArray: newWordArray
                  };
                });
                boxRef[id].disabled = true;
              }}
              style={{
                backgroundColor: BOX_COLOR[
                  ownerOfThisBase(game.boardPositioning[i], game.numberOfPlayer)
                  ][
                  strengthOfThisBase(game.boardPositioning[i], game.numberOfPlayer)
                  ],
              }}
            >
              {ALPHABET[game.boardBase[i]]}
            </button>
          ))
        }
      </div>
      <Layout>
        <pre>letter-block.game/bd/{gameId}</pre>
        <BoardWordHistory wordPlayeds={game.wordPlayeds} playerColors={playerColors}/>
      </Layout>
    </div>
  )
}

export default Game