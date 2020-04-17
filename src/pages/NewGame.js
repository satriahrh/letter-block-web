import React from "react";
import module from './NewGame.module.scss'
import {Redirect} from "react-router-dom"

class NewGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      form: {
        numberOfPlayer: '',
      }
    };

    this.handleFormNumberOfPlayerChange = this.handleFormNumberOfPlayerChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  formValidateNumberOfPlayer(value) {
    if (!(2 <= value && value <= 5)) {
      alert("minimum 2, maximum 5");
      return false
    }
    return true
  }

  handleFormNumberOfPlayerChange(event) {
    let value = event.target.value;
    if (value) {
      if (!this.formValidateNumberOfPlayer(value)) {
        return
      }
    }
    this.setState((prevState, _) => {
      return {
        ...prevState,
        form: {
          ...prevState.form,
          numberOfPlayer: value
        }
      }
    });
  }

  handleSubmit(event) {
    if (!this.formValidateNumberOfPlayer(this.state.form.numberOfPlayer)) {
      return
    }
    this.setState((prevState, _) => {
      return {
        ...prevState,
        gameId: 1,
      }
    });
    event.preventDefault();
  }

  render() {
    const gameId = this.state.gameId;
    if (gameId) {
      return <Redirect push to={"/game/2"} />
    }
    return (
      <div className={module.game}>
        <form onSubmit={this.handleSubmit}>
          <h2>Mulai permainan baru?</h2>
          <div>
            <label>Jumlah pemain</label>
            <input type="number" min="1" max="5" placeholder="min 2, max 5" value={this.state.form.numberOfPlayer} onChange={this.handleFormNumberOfPlayerChange} />
          </div>
          <input type="submit" value="Mulai!!"/>
        </form>
      </div>
    );
  }
}

export default NewGame