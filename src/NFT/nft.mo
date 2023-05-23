import Debug "mo:base/Debug";
import Principal "mo:base/Principal";

actor class NFT (name: Text, owner: Principal, content : [Nat8]) = this {
    private let itemName = name;
    private var nftOwner = owner;
    private let imageByte = content;

    public query func getName() : async Text {
        return itemName;
    };

    public query func getOwner() : async Principal {
        return nftOwner;
    };

    public query func getAsset() : async [Nat8] {
        return imageByte;
    };

    public query func getCanisterId() : async Principal {
        return Principal.fromActor(this);
    };

    public shared(msg) func transferOwnership(newOwner : Principal): async Text{
        if(Principal.equal(nftOwner, msg.caller)){
            nftOwner := newOwner;
            return "Success";
        } else {
            return "You're not the owner of this NFT";
        }
    };

};