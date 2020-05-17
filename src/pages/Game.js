import React, {useState} from 'react';
import {useParams} from 'react-router';
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

let boxRef = [];
let sendRef = null;

function Game() {
  let {gameId} = useParams();

  const [values, setValues] = useState({
    currentPlayerOrder: 0,
    players: [{id: 123,}],
    numberOfPlayer: 3,
    boardBase: Array(25).fill(0).map((_, id) => (id)),
    boardPositioning: Array(25).fill(0),
    wordPlayeds: [],
    wordArray: []
  });

  let playerColors = new Map();
  values.players.forEach((player, id) => {
    playerColors.set(player.id, BOX_COLOR[id + 1][1])
  });

  return (
    <div className={module.board}>
      <Heading>
        <p style={{margin: "0"}}>
          <span
            style={{color: currentPlayerColor(values.currentPlayerOrder)}}
          >{currentPlayer(values.currentPlayerOrder, values.players)}</span>'s
          turn
        </p>
      </Heading>
      <div className={module.word}>
        <p>{processWord(values.wordArray, values.boardBase)}</p>
      </div>
      <div className={module.base}>
        <button
          className={module.nav}
          onClick={e => {
            values.wordArray.forEach(i => {
              boxRef[i].disabled = false
            });
            sendRef.disabled = true;

            setValues(prevValues => ({
              ...prevValues,
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
                setValues(prevValues => {
                  let newWordArray = [].concat(values.wordArray, id);
                  if (newWordArray.length >= 3) {
                    sendRef.disabled = false
                  }
                  return {
                    ...prevValues,
                    wordArray: newWordArray
                  };
                });
                boxRef[id].disabled = true;
              }}
              style={{
                backgroundColor: BOX_COLOR[
                  ownerOfThisBase(values.boardPositioning[i], values.numberOfPlayer)
                  ][
                  strengthOfThisBase(values.boardPositioning[i], values.numberOfPlayer)
                  ],
              }}
            >
              {ALPHABET[values.boardBase[i]]}
            </button>
          ))
        }
      </div>
      <Layout>
        <pre>letter-block.game/bd/{gameId}</pre>
        <BoardWordHistory wordPlayeds={values.wordPlayeds} playerColors={playerColors}/>
      </Layout>
    </div>
  )
}

export default Game