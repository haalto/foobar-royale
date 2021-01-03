import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import Controller from "./views/Controller";
import Game from "./views/Game";
import Landing from "./views/Landing";

const GlobalStyle = createGlobalStyle`
  html {
    min-height: 100%;
  }
  body {
    background-color: lightblue;
  }
`;

function App() {
  return (
    <>
      <BrowserRouter>
        <Switch>
          <Route exact path="/controller" component={Controller} />
          <Route path="/game" component={Game} />
          <Route path="/" component={Landing} />
        </Switch>
      </BrowserRouter>
      <GlobalStyle />
    </>
  );
}

export default App;
