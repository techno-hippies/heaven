// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title PartnerLink - Public mutual partner badge ("ring")
/// @notice Mutual opt-in link between two addresses; either side can break.
/// @dev This is orthogonal to Dating.sol matching - purely a public social commitment.
///      Use cases:
///      - "Partnered with 0x..." badge in UI
///      - Couples signaling commitment publicly
///      - Does NOT affect FHE matching logic
contract PartnerLink {
    mapping(address => address) public proposedTo;   // proposer -> proposed partner
    mapping(address => address) public partnerOf;    // confirmed mutual partner

    event PartnerProposed(address indexed proposer, address indexed partner);
    event PartnerAccepted(address indexed a, address indexed b);
    event PartnerBroken(address indexed a, address indexed b);
    event ProposalCancelled(address indexed proposer, address indexed partner);

    error AlreadyPartnered();
    error InvalidPartner();
    error NoProposal();
    error NotPartnered();

    /// @notice Propose a partnership to another address
    /// @param partner The address to propose to
    function proposePartner(address partner) external {
        if (partner == address(0) || partner == msg.sender) revert InvalidPartner();
        if (partnerOf[msg.sender] != address(0) || partnerOf[partner] != address(0)) revert AlreadyPartnered();

        proposedTo[msg.sender] = partner;
        emit PartnerProposed(msg.sender, partner);
    }

    /// @notice Accept the proposal from `proposer` to msg.sender
    /// @param proposer The address that proposed to you
    function acceptPartner(address proposer) external {
        if (proposer == address(0) || proposer == msg.sender) revert InvalidPartner();
        if (partnerOf[msg.sender] != address(0) || partnerOf[proposer] != address(0)) revert AlreadyPartnered();
        if (proposedTo[proposer] != msg.sender) revert NoProposal();

        // Clear proposal
        proposedTo[proposer] = address(0);

        // Set mutual link
        partnerOf[msg.sender] = proposer;
        partnerOf[proposer] = msg.sender;

        emit PartnerAccepted(proposer, msg.sender);
    }

    /// @notice Cancel your outgoing proposal
    function cancelProposal() external {
        address partner = proposedTo[msg.sender];
        if (partner == address(0)) revert NoProposal();
        proposedTo[msg.sender] = address(0);
        emit ProposalCancelled(msg.sender, partner);
    }

    /// @notice Either side can break the mutual link
    function breakPartner() external {
        address p = partnerOf[msg.sender];
        if (p == address(0)) revert NotPartnered();

        // Clear both sides
        partnerOf[msg.sender] = address(0);
        if (partnerOf[p] == msg.sender) {
            partnerOf[p] = address(0);
        }

        emit PartnerBroken(msg.sender, p);
    }

    /// @notice Check if an address is partnered
    /// @param a The address to check
    /// @return True if the address has a confirmed partner
    function isPartnered(address a) external view returns (bool) {
        return partnerOf[a] != address(0);
    }

    /// @notice Get the partner of an address (or address(0) if none)
    /// @param a The address to check
    /// @return The partner address or address(0)
    function getPartner(address a) external view returns (address) {
        return partnerOf[a];
    }

    /// @notice Check if there's a pending proposal from one address to another
    /// @param from The proposer
    /// @param to The proposed partner
    /// @return True if `from` has proposed to `to`
    function hasProposal(address from, address to) external view returns (bool) {
        return proposedTo[from] == to;
    }
}
