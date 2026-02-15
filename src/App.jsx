import React from "react";
import { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/login/Login";
import Signup from "./pages/signin/Signup";
import Rounds from "./pages/Rounds/Rounds";
import FirstRound from "./pages/Rounds/FristRound";
import NextRound from "./pages/Rounds/NextRound";
import Tournaments from "./pages/Tournaments/Tournaments";
import TournamentDetails from "./pages/TournamentDetail/TournamentDetails";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const App = () => {
  const routes = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
      children:[
        {index:true,element:<Login/>},
        {path:"/register",element:<Signup/>},
        {path:"/tournaments",element:<Tournaments/>},
        {path:"/tournaments/:tournamentId/rounds/first",element:<FirstRound/>},
        {path:"/tournaments/:tournamentId/rounds/next",element:<NextRound/>},
        {path:"/tournaments/:tournamentId",element:<TournamentDetails/>},
        {path:"/tournaments/:tournamentId/rounds",element:<Rounds/>},
      ]
    },
  ]);
  return (
    <>
      <RouterProvider router={routes}/>
    </>
  );
};

export default App;
