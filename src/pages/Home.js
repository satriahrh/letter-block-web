import React from "react";
import module from "./Home.module.scss"
import {Link} from "react-router-dom";

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      onGoingGames: [],
      user: {},
    }
  }

  componentDidMount() {
    this.setState((prevState) => (
      {
        ...prevState,
        onGoingGames: [
          {id: 1, currentPlayerId: 3},
          {id: 2, currentPlayerId: 1},
          {id: 3, currentPlayerId: 2},
          {id: 4, currentPlayerId: 5},
        ],
        user: {
          id: 1,
        }
      }
    ))
  }

  render() {
    let onGoingGames = null
    if (this.state.onGoingGames.length > 0) {
      onGoingGames = <div>
        <h2>On Going Games</h2>
        <ul>
        {
          this.state.onGoingGames.map((game, id) => (
            <li key={id}><Link to={"/game/" + game.id}>{game.id}{game.currentPlayerId === this.state.user.id ? ' --- YOUR TURN!!' : null}</Link></li>
          ))
        }
        </ul>
      </div>
    }
    return (
      <div className={module.home}>
        <h1>Home</h1>
        {onGoingGames}
      </div>
    );
  }
}

export default Home