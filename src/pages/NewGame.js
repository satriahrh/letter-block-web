import React from "react";
import module from "./NewGame.module.scss";
import { Redirect } from "react-router-dom";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { useState } from "react";

const NEW_GAME = gql`
  mutation NewGame($numberOfPlayer: Int!) {
    newGame(input: { numberOfPlayer: $numberOfPlayer }) {
      id
    }
  }
`;

function NewGame() {
  const [values, setValues] = useState({ numberOfPlayer: "" });
  const [newGame, { data, error }] = useMutation(NEW_GAME);

  if (error) {
    alert(error);
  }

  if (data) {
    return <Redirect push to={"/game/" + data.newGame.id} />;
  }

  return (
    <div className={module.game}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          newGame({ variables: { numberOfPlayer: values.numberOfPlayer } });
        }}
      >
        <h2>Mulai permainan baru?</h2>
        <div>
          <label>Jumlah pemain</label>
          <input
            type="number"
            min="1"
            max="5"
            placeholder="min 2, max 5"
            value={values.numberOfPlayer}
            onChange={(e) => {
              let value = e.target.value;
              if (value) {
                if (!(2 <= value && value <= 5)) {
                  alert("minimum 2, maximum 5");
                  return;
                }
              }
              setValues((values) => ({ ...values, numberOfPlayer: value }));
            }}
          />
        </div>
        <input type="submit" value="Mulai!!" />
      </form>
    </div>
  );
}

export default NewGame;
