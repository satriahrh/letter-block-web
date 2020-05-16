import React from "react";
import module from "./Home.module.scss"
import {Link} from "react-router-dom";

import gql from 'graphql-tag';
import {useQuery} from '@apollo/react-hooks';

function Home() {
  const {error, data} = useQuery(gql`
    query {
      myGames {
        id
      }
    }
  `);

  if (error) {
    console.log(error)
  }

  let games = []
  if (data) {
    games = data.myGames
  }

  let onGoingGames = null
  if (games.length > 0) {
    onGoingGames = <div>
      <h2>On Going Games</h2>
      <ul>
        {
          games.map((game, id) => (
            <li key={id}><Link
              to={"/game/" + game.id}>{game.id}
              {/*{game.currentPlayerId === this.state.user.id ? ' --- YOUR TURN!!' : null}*/}
            </Link>
            </li>
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

export default Home