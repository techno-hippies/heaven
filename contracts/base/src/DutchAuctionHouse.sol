// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface ISubnameRegistrarV2 {
    function reserved(bytes32 labelHash) external view returns (bool);
    function labelHashToTokenId(bytes32 labelHash) external view returns (uint256);
    function price(string calldata label, uint256 duration) external view returns (uint256);
    function operatorRegister(string calldata label, address to, uint256 duration) external payable returns (uint256);
}

/// @title DutchAuctionHouse
/// @notice Dutch auction for premium reserved names
/// @dev Price decreases linearly from startPrice to endPrice over the auction period
contract DutchAuctionHouse is Ownable, ReentrancyGuard {
    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error AuctionNotFound();
    error AuctionNotActive();
    error AlreadySold();
    error InvalidParams();
    error LabelMismatch();
    error NotReserved();
    error AlreadyRegistered();
    error InsufficientPayment();
    error NothingToWithdraw();
    error AuctionAlreadyExists();

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event AuctionCreated(
        bytes32 indexed labelHash,
        uint128 startPrice,
        uint128 endPrice,
        uint64 startTime,
        uint64 endTime
    );
    event AuctionBought(
        bytes32 indexed labelHash,
        address indexed buyer,
        uint256 premiumPaid,
        uint256 basePaid,
        uint256 tokenId
    );
    event AuctionCancelled(bytes32 indexed labelHash);
    event ProceedsWithdrawn(address indexed to, uint256 amount);

    /*//////////////////////////////////////////////////////////////
                                 STORAGE
    //////////////////////////////////////////////////////////////*/

    struct Auction {
        uint128 startPrice; // premium component (decreases over time)
        uint128 endPrice;   // minimum premium
        uint64 startTime;
        uint64 endTime;
        bool sold;
    }

    ISubnameRegistrarV2 public immutable registrar;

    /// @notice labelHash => Auction
    mapping(bytes32 => Auction) public auctions;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address _registrar, address _owner) Ownable(_owner) {
        registrar = ISubnameRegistrarV2(_registrar);
    }

    /*//////////////////////////////////////////////////////////////
                            AUCTION MANAGEMENT
    //////////////////////////////////////////////////////////////*/

    /// @notice Create a new Dutch auction for a reserved label
    /// @param labelHash keccak256(bytes(label)) - the label to auction
    /// @param startPrice Starting premium price (highest)
    /// @param endPrice Ending premium price (lowest)
    /// @param startTime When the auction starts
    /// @param endTime When the auction ends
    function createAuction(
        bytes32 labelHash,
        uint128 startPrice,
        uint128 endPrice,
        uint64 startTime,
        uint64 endTime
    ) external onlyOwner {
        if (startPrice < endPrice) revert InvalidParams();
        if (endTime <= startTime) revert InvalidParams();
        if (endTime <= block.timestamp) revert InvalidParams(); // auction already ended
        if (auctions[labelHash].endTime != 0) revert AuctionAlreadyExists(); // prevent overwrite

        // Ensure it's reserved in registrar (public can't front-run)
        if (!registrar.reserved(labelHash)) revert NotReserved();

        // Ensure not currently registered
        if (registrar.labelHashToTokenId(labelHash) != 0) revert AlreadyRegistered();

        auctions[labelHash] = Auction({
            startPrice: startPrice,
            endPrice: endPrice,
            startTime: startTime,
            endTime: endTime,
            sold: false
        });

        emit AuctionCreated(labelHash, startPrice, endPrice, startTime, endTime);
    }

    /// @notice Cancel an auction (only if not sold)
    function cancelAuction(bytes32 labelHash) external onlyOwner {
        Auction memory a = auctions[labelHash];
        if (a.endTime == 0) revert AuctionNotFound();
        if (a.sold) revert AlreadySold();
        delete auctions[labelHash];
        emit AuctionCancelled(labelHash);
    }

    /*//////////////////////////////////////////////////////////////
                              BUYING
    //////////////////////////////////////////////////////////////*/

    /// @notice Get current premium price for an auction
    /// @param labelHash The label hash to check
    /// @return Current premium price (decreases linearly over time)
    function currentPremiumPrice(bytes32 labelHash) public view returns (uint256) {
        Auction memory a = auctions[labelHash];
        if (a.endTime == 0) revert AuctionNotFound();

        if (block.timestamp <= a.startTime) return a.startPrice;
        if (block.timestamp >= a.endTime) return a.endPrice;

        uint256 elapsed = block.timestamp - a.startTime;
        uint256 total = a.endTime - a.startTime;
        uint256 diff = uint256(a.startPrice) - uint256(a.endPrice);

        // Linear decay: startPrice - (diff * elapsed / total)
        return uint256(a.startPrice) - (diff * elapsed) / total;
    }

    /// @notice Get total price to buy now (premium + base registration fee)
    /// @param label The label string
    /// @param duration Registration duration in seconds
    /// @return premium The current premium price
    /// @return base The base registration fee from registrar
    /// @return total Premium + base
    function totalPrice(string calldata label, uint256 duration)
        external
        view
        returns (uint256 premium, uint256 base, uint256 total)
    {
        bytes32 labelHash = keccak256(bytes(label));
        premium = currentPremiumPrice(labelHash);
        base = registrar.price(label, duration);
        total = premium + base;
    }

    /// @notice Buy an auctioned name
    /// @param label The label string (verified against labelHash)
    /// @param duration Registration duration in seconds
    /// @return tokenId The minted token ID
    function buy(string calldata label, uint256 duration)
        external
        payable
        nonReentrant
        returns (uint256 tokenId)
    {
        bytes32 labelHash = keccak256(bytes(label));

        Auction storage a = auctions[labelHash];
        if (a.endTime == 0) revert AuctionNotFound();
        if (a.sold) revert AlreadySold();
        if (block.timestamp < a.startTime) revert AuctionNotActive();
        if (block.timestamp > a.endTime) revert AuctionNotActive();

        uint256 premium = currentPremiumPrice(labelHash);
        uint256 base = registrar.price(label, duration);
        uint256 total = premium + base;

        if (msg.value < total) revert InsufficientPayment();

        // Mark as sold (effects before interactions)
        a.sold = true;

        // Mint via registrar (pays base fee to registrar)
        tokenId = registrar.operatorRegister{value: base}(label, msg.sender, duration);

        emit AuctionBought(labelHash, msg.sender, premium, base, tokenId);

        // Refund excess
        if (msg.value > total) {
            (bool ok,) = msg.sender.call{value: msg.value - total}("");
            require(ok, "Refund failed");
        }
        // Premium stays in this contract as proceeds
    }

    /*//////////////////////////////////////////////////////////////
                              ADMIN
    //////////////////////////////////////////////////////////////*/

    /// @notice Withdraw accumulated premium proceeds
    function withdraw(address payable to) external onlyOwner nonReentrant {
        uint256 bal = address(this).balance;
        if (bal == 0) revert NothingToWithdraw();
        (bool ok,) = to.call{value: bal}("");
        require(ok, "Withdraw failed");
        emit ProceedsWithdrawn(to, bal);
    }

    /*//////////////////////////////////////////////////////////////
                              VIEWS
    //////////////////////////////////////////////////////////////*/

    /// @notice Check if an auction exists and is active
    function isActive(bytes32 labelHash) external view returns (bool) {
        Auction memory a = auctions[labelHash];
        if (a.endTime == 0) return false;
        if (a.sold) return false;
        if (block.timestamp < a.startTime) return false;
        if (block.timestamp > a.endTime) return false;
        return true;
    }

    /// @notice Check if an auction exists (active or not)
    function exists(bytes32 labelHash) external view returns (bool) {
        return auctions[labelHash].endTime != 0;
    }
}
