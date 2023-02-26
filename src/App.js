import logo from './logo.svg';
import './App.css';
import React, {Component} from 'react';

const NUMBER_BUTTON_ARANGEMENT = [
  ["7", "seven"],
  ["8", "eight"],
  ["9", "nine"],
  ["4", "four"],
  ["5", "five"],
  ["6", "six"],
  ["1", "one"],
  ["2", "two"],
  ["3", "three"],
  ["0", "zero"],
  [".", "decimal"]
];

const OPERATOIN_BUTTON_ARANGEMENT = [
  ["AC", "clear"],
  ["x", "multiply", "*"],
  ["/", "divide"],
  ["+", "add"],
  ["-", "subtract"],
  ["=", "equals"]
];

const isOperator = /[\*/+-]/
, endsWithOperator = /[\*+-/]$/
, endsWithDoubleNegativeSign = /\d[\*/+-]{1}-$/ //checks if its an operator then a neg

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      formula: "",
      formulaSavePoint: "",
      currentInput: "0",
      evaluated: false
    }
    this.processInput = this.processInput.bind(this);
  }

  processInput(thingToAdd) {
    var state = this.state
    var curInput = state.currentInput
    var formula = state.formula
    var savePoint = state.formulaSavePoint
    var wasEvaluated = state.evaluated;
    
    //console.log(thingToAdd);

    switch(thingToAdd){
      case "=":
        if(!formula.includes("=")){
          if(endsWithDoubleNegativeSign.test(formula)){
            formula=formula.slice(0, -1);
          }
          if(endsWithOperator.test(formula)){
            formula=formula.slice(0, -1);
          }
          //such a stupid hacky way to do this
          //.replace(/x/g, "*")
          formula = formula.replace(/--/g, "+0+0+0+0+0+0+");
  
          const answer = Math.round(1e12 * eval(formula)) / 1e12;
          //really hate to use eval but theres not really an easier way to do this minus a library, 
          //I wont include this on my website because of the eval,
          //or maybe just have it as a codepen link?
  
          this.setState({
            currentInput: answer.toString(),
            formula: formula.replace(/\+0\+0\+0\+0\+0\+0\+/g, "--") + "=" + answer,
            formulaSavePoint: answer,
            evaluated: true
          });
        }
        break;
      case "*":
      case "/":
      case "+":
      case "-":
        this.setState({
          currentInput: thingToAdd,
          evaluated: false
        });
        if(wasEvaluated){
          this.setState({
            formula: savePoint + thingToAdd
          });
        }
        else{
          if(formula === ""){
            this.setState({
              formula: savePoint + thingToAdd //should be 0 and then the operator
            });
          }
          else if(endsWithOperator.test(formula)){
            if(endsWithDoubleNegativeSign.test(formula)){
              if(thingToAdd !== "-"){
                this.setState({
                  formula: savePoint + thingToAdd
                });
              }
            }
            else{
              this.setState({
                formula: 
                  (endsWithDoubleNegativeSign.test(formula + thingToAdd) 
                  ? formula 
                  : savePoint) + thingToAdd
              }); 
            }
          }
          else{
            this.setState({
              formulaSavePoint: formula, 
              formula: formula + thingToAdd
            });
          }
        }
        break;
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        this.setState({
          evaluated: false
        });
        if(wasEvaluated){
          this.setState({
            currentInput: thingToAdd,
            formula: ("0" !== thingToAdd) ? thingToAdd : ""
          });
        }
        else if(curInput.length <= 21){
          this.setState({
            currentInput: 
            (("0" === curInput) || isOperator.test(curInput)) 
            ? thingToAdd 
            : curInput + thingToAdd,
            formula: 
            ("0" === curInput) && ("0" === thingToAdd) //if input is 0
            ? "" === formula //if formula blank
              ? thingToAdd //make it 0
              : formula //else keep it 0
            : /([^.0-9]0|^0)$/.test(formula) //if formula is 0, unless theres a decimal
              ? formula.slice(0, -1) + thingToAdd
              : formula + thingToAdd
          });
        }
        break;
      case ".":
        this.setState({
          evaluated: false
        });
        if(wasEvaluated){
          this.setState({
            currentInput: "0.",
            formula: "0."
          });
        }
        else if(curInput.length <= 21 && !(curInput.includes("."))){
          if(endsWithOperator.test(formula) || 
            ("0" === curInput && "" === formula)){
              this.setState({
                currentInput: "0.",
                formula: formula + "0."
              });
          }
          else{
            this.setState({
              currentInput: curInput + ".",
              formula: formula + "."
            });
          }
        }
        break;
      case "AC":
        this.setState({
          currentInput: "0",
          formulaSavePoint: "0",
          formula: "",
          evaluated: false
        })
        break;
      default: //clear
        break;
    }
  }

  render(){
    const numberPanelButtons = NUMBER_BUTTON_ARANGEMENT.map(
      elem => <CalcButton 
      key={elem[0]} 
      value={elem.length>2 ? elem[2] : elem[0]} 
      id={elem[1]} 
      sendValue={this.processInput} />);
    const operationsPanelButtons = OPERATOIN_BUTTON_ARANGEMENT.map(
      elem => <CalcButton 
      key={elem[0]} 
      value={elem.length>2 ? elem[2] : elem[0]} 
      id={elem[1]} 
      sendValue={this.processInput} />);

    return (
      <div id="calculator">
        <Display displayFormula={this.state.formula} displayInput={this.state.currentInput}/>
        <div id="buttons">
          <div className="panel" id="numberPanel">
            {numberPanelButtons}
          </div>
          <div className="panel" id="operationsPanel">
            {operationsPanelButtons}
          </div>
        </div>
      </div>
    )
  }
}

class Display extends Component {
  render(){
    return (
      <div>
        <p className="displayPanel" id="formulaDisplay">&nbsp;{this.props.displayFormula}</p>
        <p className="displayPanel" id="display">{this.props.displayInput}</p>
      </div>
    );
  }
}

class CalcButton extends Component {
  render(){
    return (
      <button className="calcButton" id={this.props.id} onClick={() => this.props.sendValue(this.props.value)} >
        {this.props.value}
        {/** I want to add a little beep when you press buttons <audio className="clip" id={this.props.audioKey} src={"https://s3.amazonaws.com/freecodecamp/drums/" + this.props.audioName + ".mp3"} /> */}
      </button>
    );
  }
}

export default App;
