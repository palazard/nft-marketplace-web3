import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import {Principal} from '@dfinity/principal'
import { idlFactory } from "../../../declarations/nft";
import {Actor, HttpAgent} from "@dfinity/agent"

function Item(props) {

  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [image, setImage] = useState();

  const NFTId = Principal.fromText(props.NFTId);

  const localHost = "http://localhost:8080/";

  const agent = new HttpAgent({host : localHost});

  async function loadNFT() {
    const NFTActor = await Actor.createActor(idlFactory, {
      agent,
      canisterId : NFTId,
    });

    const name = await NFTActor.getName();
    setName(name);

    const owner = await NFTActor.getOwner();
    setOwner(owner.toText());

    const imageData = await NFTActor.getAsset();
    const imageContent = new Uint8Array(imageData);
    console.log(imageContent);
    const blob = new Blob([imageContent.buffer], { type: "image/png" });
    console.log(blob);
    const image = URL.createObjectURL(blob);
    setImage(image);
  };

  useEffect(() => {
    loadNFT();
  }, []);
  


  return (
    <div className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
        />
        <div className="disCardContent-root">
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text"></span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Item;
