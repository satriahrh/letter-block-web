import React, { createContext, useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";

const ME = gql`
  query {
    me {
      playerId: id
      username
    }
  }
`;

export const UserContext = createContext();

export const UserContextProvider = (props) => {
  const [state, setState] = useState({
    user: {
      playerId: 0,
      username: "",
    },
  });
  useQuery(ME, {
    onCompleted: (data) => {
      setState((prevState) => ({
        ...prevState,
        user: data.me,
      }));
    },
    onError: (error) => {
      console.log(error);
      alert(error);
    },
  });

  return (
    <UserContext.Provider value={state.user}>
      {props.children}
    </UserContext.Provider>
  );
};
