import React from 'react'
import module from "./BoardWordHistory.module.scss"

export default function BoardWordHistory(props) {
  let playerColors = props.playerColors;
  let words = props.wordPlayeds.map((wordPlayed) => (
    <li><span style={{color: playerColors.get(wordPlayed.playerId)}}>{wordPlayed.word}</span></li>
  ));
  return (
    <div className={module.history}>
      <h2>word history</h2>
      <ul>
        {words}
      </ul>
    </div>
  )
}