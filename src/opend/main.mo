import Principal "mo:base/Principal";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import NFTActorClass "../NFT/nft";
import HashMap "mo:base/HashMap";
import List "mo:base/List";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Bool "mo:base/Bool";

actor openD {

    private type Listing = {
        itemOwner: Principal;
        itemPrice: Nat;
    };
    
    let mapOfNFTs = HashMap.HashMap<Principal, NFTActorClass.NFT>(1, Principal.equal, Principal.hash);
    let mapOfOwners = HashMap.HashMap<Principal, List.List<Principal>>(1, Principal.equal, Principal.hash);
    let mapOfListing = HashMap.HashMap<Principal, Listing>(1, Principal.equal, Principal.hash);

    public shared(msg) func mint (imgData: [Nat8], name: Text) : async Principal {

        let owner : Principal = msg.caller;
        Debug.print(debug_show (owner));

        Debug.print(debug_show (Cycles.balance()));
        Cycles.add(100_500_000_000);

        let newNFT = await NFTActorClass.NFT(name, owner, imgData);
        
        Debug.print(debug_show (Cycles.balance()));

        let newNFTId = await newNFT.getCanisterId();

        mapOfNFTs.put(newNFTId, newNFT);
        addToMapOfOwners(owner, newNFTId);

        return newNFTId;
    };

    private func addToMapOfOwners(owner : Principal, nftID : Principal){
        var ownedNFTs : List.List<Principal> = switch(mapOfOwners.get(owner)){
            case null List.nil<Principal>();
            case (?result) result;
        };
        ownedNFTs := List.push(nftID, ownedNFTs);
        mapOfOwners.put(owner, ownedNFTs);

    };

    public query func getOwnedNFTs(user : Principal): async [Principal] {
        var userNFTs : List.List<Principal> = switch(mapOfOwners.get(user)){
            case null List.nil<Principal>();
            case (?result) result;
        };

        return List.toArray(userNFTs);
    };

    public shared(msg) func listItem(NFTId : Principal, price : Nat): async Text{
        //check if the user calling this function is the actual owner of this NFT:
        var item : NFTActorClass.NFT = switch(mapOfNFTs.get(NFTId)){
            case null return "This NFT doesn't exist";
            case (?result) result;
        };

        let owner = await item.getOwner();
        if (Principal.equal(owner, msg.caller)){
            let newItem : Listing = {
                itemOwner = msg.caller;
                itemPrice = price;
            };
            mapOfListing.put(NFTId, newItem);
            return "Success"
        } else {
            return "You're not the owner of this NFT"
        };
        
    };

    public query func getCanisterId(): async Principal {
        return Principal.fromActor(openD);
    };

    
    public query func isListed(id: Principal): async Bool {
        if(mapOfListing.get(id)==null){
            return false;
        } else {
            return true;
        };
    };

    public query func getListedNFTs(): async [Principal] {
        var listedNFTs = Iter.toArray(mapOfListing.keys());
        return listedNFTs;
    };

    public query func getOriginalOwner(id : Principal) : async Principal {
        var NTFItem : Listing = switch(mapOfListing.get(id)){
            case null return Principal.fromText("");
            case (?result) result;
        };
         return NTFItem.itemOwner;
    };

    public query func getListedNFTPrice(id : Principal) : async Nat {
        var NTFItem : Listing = switch(mapOfListing.get(id)){
            case null return 0;
            case (?result) result;
        };
         return NTFItem.itemPrice;
    };

    public shared(msg) func completePurchase(NFTId: Principal, ownerId: Principal, newOwnerId: Principal): async Text {
        var purchasedNFT : NFTActorClass.NFT = switch(mapOfNFTs.get(NFTId)){
            case null return "This NFT doesn't exist";
            case (?result) result;
        };

        let transferResult = await purchasedNFT.transferOwnership(newOwnerId);

        if (transferResult == "Success"){

            mapOfListing.delete(NFTId);

            var ownedNFTs : List.List<Principal> = switch(mapOfOwners.get(ownerId)){
            case null List.nil<Principal>();
            case (?result) result;
            };

            ownedNFTs :=  List.filter(ownedNFTs, func (listItem : Principal) : Bool {listItem==NFTId});
            // mapOfOwners.put(ownerId, ownedNFTs); //useless beacause we already update the list, so the hasmap is actualized too.

            addToMapOfOwners(newOwnerId, NFTId);

            return "Success"

        } else {

            return transferResult;
        }    

    };

};
