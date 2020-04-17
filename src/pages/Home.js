import React from "react";
import module from "./Home.module.scss"

class Home extends React.Component {
  render() {
    return (
      <div className={module.home}>
        <h1>Home</h1>
      </div>
    );
  }
}

export default Home