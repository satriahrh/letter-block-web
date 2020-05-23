import React, {useState} from "react";
import module from "./Home.module.scss";
import {Link} from "react-router-dom";

import gql from "graphql-tag";
import {useQuery} from "@apollo/react-hooks";

function Home() {
  const [state, setState] = useState({});

  useQuery(gql`
    query {
      myGames {
        id
      }
    }
  `, {
    onCompleted: data => {
      setState(prevState => ({
        ...prevState,
        games: data.myGames.map((game, id) => (
          <li key={id}>
            <Link to={"/game/" + game.id}>
              {game.id}
              {/*{game.currentPlayerId === this.state.user.id ? ' --- YOUR TURN!!' : null}*/}
            </Link>
          </li>
        )),
      }))
    },
    onError: error => {
      alert(error.message);
    }
  });

  return (
    <div className={module.home}>
      <h1>Home</h1>
      {state.games}
    </div>
  );
}

export default Home;
