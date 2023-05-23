import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import homeImage from "../../assets/home-img.png"
import { BrowserRouter, Link, Switch, Route } from "react-router-dom";
import Gallery from "./Gallery";
import Minter from "./Minter";
import {opend} from "../../../declarations/opend";
import CURRENT_USER_ID from "../index";

function Header() {

  const [userNFTs, setUserNFTs] = useState();
  const [listedNFTs, setListedNFTs] = useState();

  async function getNFTs(){
    const ids = await opend.getOwnedNFTs(CURRENT_USER_ID);
    // console.log(ids);
    setUserNFTs(<Gallery userNFTIds={ids} title="My NFTs" role="collection"/>);
    // setUserNFTs(ids);

    const listedIds = await opend.getListedNFTs();
    console.log(listedIds);
    setListedNFTs(<Gallery userNFTIds={listedIds} title="Discover" role="discover"/>);
  };

  useEffect( () => {
    getNFTs();
  }, [])

  return (
    <BrowserRouter forceRefresh={true}>
      <div className="app-root-1">
        <header className="Paper-root AppBar-root AppBar-positionStatic AppBar-colorPrimary Paper-elevation4">
          <div className="Toolbar-root Toolbar-regular header-appBar-13 Toolbar-gutters">
            <div className="header-left-4"></div>
            <img className="header-logo-11" src={logo} />
            <div className="header-vertical-9"></div>
            <h5 className="Typography-root header-logo-text">
              <Link to="/">OpenD</Link>
            </h5>
            <div className="header-empty-6"></div>
            <div className="header-space-8"></div>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/discover">Discover</Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/minter">Minter</Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/collection">My NFTs</Link>
            </button>
          </div>
        </header>
      </div>
      <Switch>
        <Route exact path="/">
          <img className="bottom-space" src={homeImage} />
        </Route>
        <Route path="/discover">
            {listedNFTs}
        </Route>
        <Route path="/minter">
          <Minter />
        </Route>
        <Route path="/collection">
            {/* <Gallery userNFTIds={userNFTs} title="My NFTs"/> */}
            {userNFTs}
        </Route>
        {/* With v6 on react router */}
        {/* <Route
          exact path="/"
          element={<img className="bottom-space" src={homeImage} />}
        />
        <Route 
          path="/discover"
          element={<h1>Discover</h1>}
        />
        <Route 
          path="/minter"
          element={<Minter />}  
        />
        <Route 
          path="/collection"
          // element={userNFTs}
          element={<Gallery userNFTIds={userNFTs} title="My NFTs"/>}
        /> */}
      </Switch>
    </BrowserRouter>
  );
}

export default Header;
