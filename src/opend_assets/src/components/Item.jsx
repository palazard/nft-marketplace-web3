import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import {Principal} from '@dfinity/principal'
import { idlFactory } from "../../../declarations/nft";
import {Actor, HttpAgent} from "@dfinity/agent"
import Button from "./Button";
import {opend} from "../../../declarations/opend";
import {useLocation} from "react-router-dom";
import CURRENT_USER_ID from "../index";
import PriceLabel from "./PriceLabel";

function Item(props) {

  const [name, setName] = useState(); //1
  const [owner, setOwner] = useState(); //2
  const [image, setImage] = useState(); //3
  // const [button, setButton] = useState();
  const [buttonTitle, setButtonTitle] = useState('Sell'); //4
  const [price, setPrice] = useState("");  //5
  const [isHiddenInput, setIsHiddenInput]= useState(true); //6
  const [isHiddenLoader, setIsHiddenLoader]= useState(true);  //7
  const [isHiddenButton, setIsHiddenButton]= useState(true);  //8
  const [isHiddenSpan, setIsHiddenSpan]= useState(true);  //9
  const [priceLabel, setPriceLabel] = useState(); //10
  // const [isDisabled, setDisabled] = useState(false);


  const NFTId = (typeof props.NFTId === "string")? Principal.fromText(props.NFTId):props.NFTId;
 
  const localHost = "http://localhost:8080/";

  const agent = new HttpAgent({host : localHost});
  //TODO: delete the following line when deploy to live
  agent.fetchRootKey();

  let NFTActor;
  const location = useLocation()

  // function outside the component
  async function LoadNFTActor() {
    const NFTActorLoaded = await Actor.createActor(idlFactory, {
      agent,
      canisterId: NFTId,
    })

    return NFTActorLoaded;
  }

  async function loadNFT() {
    NFTActor = await LoadNFTActor();

    const name = await NFTActor.getName();
    setName(name);

    const owner = await NFTActor.getOwner();
    setOwner(owner.toText());

    const imageData = await NFTActor.getAsset();
    const imageContent = new Uint8Array(imageData);
    // console.log(imageContent);
    const blob = new Blob([imageContent.buffer], { type: "image/png" });
    // console.log(blob);
    const image = URL.createObjectURL(blob);
    setImage(image);

      const NFTIsListed = await opend.isListed(NFTId);
      if(NFTIsListed){
        if(props.role === "collection"){
          setIsHiddenButton(true);
          setIsHiddenSpan(false);
          setOwner("OpenD");
        } else if (props.role === "discover"){
          const originalOwner = await opend.getOriginalOwner(NFTId);
          if(originalOwner.toText()!= CURRENT_USER_ID.toText()){
            setIsHiddenButton(false);
            setButtonTitle('Buy');
            setIsHiddenSpan(true);
            setOwner(originalOwner.toText());
          };
        };
        
        const NFTPrice = await opend.getListedNFTPrice(NFTId);
        // setPrice(NFTPrice.toString());
        setPriceLabel(<PriceLabel sellPrice={NFTPrice.toString()} />);

      } else {
        setIsHiddenButton(false);
        setIsHiddenSpan(true);
      };
   
  };

  useEffect(() => {
    loadNFT();
  }, [location.key]);
  
  function handleSell(){
    setIsHiddenInput(false);
    // setButton(<Button handleClick={handleConfirmSell} title="Confirm"/>)
    setButtonTitle('Confirm');
  }

  // useEffect(()=> console.log(price), [price]);
  
  async function sellItem(){
    // setDisabled(true);
    setIsHiddenLoader(false);
    console.log(price);
    const result = await opend.listItem(NFTId, Number(price));
    console.log(result);
    if (result === "Success"){
      console.log("confirmed sucess");
      const opendID = await opend.getCanisterId();
      console.log(opendID);
      if(NFTActor === undefined){
        NFTActor = await LoadNFTActor();
      }
      const transferResult = await NFTActor.transferOwnership(opendID);
      console.log(transferResult);
      if(transferResult === "Success"){
        setIsHiddenInput(true);
        setIsHiddenLoader(true);
        setIsHiddenButton(true);
        setIsHiddenSpan(false);
      }
    };
    
  };

  async function handleBuy(){
    console.log("buying");
  };

  return (
    <div className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
        />
        <div className="disCardContent-root">
          {/* <PriceLabel sellPrice={price}/> */}
          {priceLabel}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name} {!isHiddenSpan&&<span className="purple-text">Listed</span>}
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          <div hidden={isHiddenLoader} className="lds-ellipsis">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <input
            placeholder="Price in DBLOOM"
            type="number"
            className="price-input"
            value={price}
            onChange={(event)=> {setPrice(event.target.value)}}
            hidden={isHiddenInput}
          />
          {/* {button} */}
          {!isHiddenButton&&<Button handleClick={(buttonTitle==='Sell')?handleSell:(buttonTitle==='Buy')?handleBuy:sellItem} title={buttonTitle}/>}
        </div>
      </div>
    </div>
  );
};

export default Item;
