import module from "./Heading.module.scss"
import {NavLink} from "react-router-dom";
import React from "react";

function Heading() {
  let navs = [
    {to: "/game", text: "New Game"},
  ].map((navigation) => (
    <NavLink to={navigation.to} activeStyle={{backgroundColor: "grey"}}>{navigation.text}</NavLink>
  ));

  return (
    <div className={module.heading}>
      <nav>
        <NavLink
          to="/"
          activeStyle={{backgroundColor: "grey"}}
          isActive={(_, location) => {
            return location.pathname === "/";
          }}
        >Home
        </NavLink>
        {navs}
      </nav>
    </div>
  )
}

export default Heading