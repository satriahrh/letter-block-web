import module from "./Heading.module.scss"
import {NavLink} from "react-router-dom";
import React from "react";

function Heading(props) {
  let navs = [
    {to: "/", text: "HOME"},
    {to: "/game", text: "NEW GAME"},
  ].map((navigation, id) => (
    <NavLink
      key={id}
      to={navigation.to}
      activeStyle={{backgroundColor: "grey"}}
      isActive={(_, location) => {
        return location.pathname === navigation.to;
      }}
    >
      {navigation.text}
    </NavLink>
  ));

  return (
    <div className={module.heading}>
      <nav>
        {navs}
        <div className={module.children}>
          {props.children}
        </div>
      </nav>
    </div>
  )
}

export default Heading