import React from 'react';
import module from './Board.module.scss';
import {Link} from "react-router-dom"
import Layout from "../components/Layout";
// import Pusher from 'pusher-js';

const BOX_COLOR = [
  ['#e0e0e0'], // no owner
  ['#ff9999', '#ff0000'],
  ['#ccdcff', '#0152ff'],
  ['#fbfecc', '#ecfb00'],
  ['#ffccfc', '#ffccfc'],
  ['#d0fecc', '#18fb03'],
];

class Board extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      game: {
        currentPlayerOrder: 0,
        players: [{id: 0, username: "unknown"}],
        boardBase: Array(25).fill(0),
        boardPositioning: Array(25).fill(0),
        maxStrength: 2,
        alphabet: " "
      },
      user: {
        id: 123,
        username: "Player1",
      },
      word: [],
    };

    this.boxRef = [];
    this.strengthOfThisBase = this.strengthOfThisBase.bind(this);
    this.ownerOfThisBase = this.ownerOfThisBase.bind(this);
    this.boxOnClick = this.boxOnClick.bind(this);
    this.clearOnClick = this.clearOnClick.bind(this);
    this.currentTurn = this.currentTurn.bind(this);
    this.currentTurnColor = this.currentTurnColor.bind(this);
    // this.pusher = new Pusher('f4701f248644dc0fd3cf', {
    //   cluster: 'ap1',
    //   encrypted: true,
    // });
    // this.channel = this.pusher.subscribe('lb-channel');
    // this.channel.bind('lb-event', this.updateEvents.bind(this));
  }

  // updateEvents(data) {
  //   this.setState({data: data});
  // }

  boxOnClick(e) {
    let id = e.currentTarget.id;
    this.setState((prevState, _) => {
      let newWord = [].concat(this.state.word, id);
      if (newWord.length >= 3) {
        this.sendRef.disabled = false
      }
      return {
        ...prevState,
        word: newWord,
      }
    });
    this.boxRef[id].disabled = true;
  }

  clearOnClick(e) {
    this.state.word.forEach((id) => {
      this.boxRef[id].disabled = false;
    });
    this.sendRef.disabled = true;

    this.setState((prevState, _) => {
      return {
        ...prevState,
        word: [],
      }
    });
  }

  parseAlphabet(base) {
    return this.state.game.alphabet[this.state.game.boardBase[base]]
  }

  processWord(word) {
    let result = "";
    for (let i = 0; i < word.length; i++) {
      result += this.parseAlphabet(word[i])
    }
    return result
  }

  ownerOfThisBase(position) {
    if (position === 0) {
      return 0
    }
    return position / (this.state.game.players.length + 2)
  }

  strengthOfThisBase(position) {
    return position % (this.state.game.players.length + 1)
  }

  currentTurn() {
    let currentUser = this.state.game.players[this.state.game.currentPlayerOrder]
    if (currentUser.id === this.state.user.id) {
      return "YOUR TURN!!"
    } else {
      return currentUser.username
    }
  }

  currentTurnColor() {
    return BOX_COLOR[this.state.game.currentPlayerOrder + 1][1]
  }

  componentDidMount() {
    const {id} = this.props.match.params;

    // retrieve game by game id
    let game = {
      currentPlayerOrder: 0,
      maxStrength: 2,

      players: [{id: 123, username: "Player1"}, {id: 124, username: "Player2"}],
      boardBase: this.state.game.boardBase.map((_, id) => (id)),
      boardPositioning: Array(25).fill(0),
      alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    };

    this.setState((prevState, _) => ({
        ...prevState,
        game: game,
        gameId: id,
      })
    )
  }

  render() {
    return (
      <div className={module.board}>
        <div className={module.word}>
          <p>{this.processWord(this.state.word)}</p>
        </div>
        <div className={module.base}>
          <button
            className={module.nav} onClick={this.clearOnClick}
          >
            CLEAR
          </button>
          <button
            className={module.nav} disabled={true}
            ref={(r) => this.sendRef = r}
          >
            SEND
          </button>
          {
            [...Array(25).keys()].map((id) => (
              <button
                id={id} className={module.box}
                onClick={this.boxOnClick}
                ref={(r) => this.boxRef[id] = r}
                style={{
                  'backgroundColor': BOX_COLOR[
                    this.ownerOfThisBase(this.state.game.boardPositioning[id])
                    ][
                    this.strengthOfThisBase(this.state.game.boardPositioning[id])
                    ],
                }}
              >
                {this.state.game.alphabet[this.state.game.boardBase[id]]}
              </button>
            ))
          }
        </div>
        <Layout>
          <p>Turn: <span style={{color: this.currentTurnColor()}}>{this.currentTurn()}</span></p>
          <pre>letter-block.game/bd/{this.state.gameId}</pre>
          <p><Link to="/">Home</Link></p>
        </Layout>
      </div>
    )
  }
}

export default Board;
