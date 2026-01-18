// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title DirectoryV2 - Minimal public profile registry
/// @notice Stores ONLY public discovery fields. Anything here is publicly readable on-chain.
/// @dev 0 = hidden/unset encoding for optional fields.
contract DirectoryV2 {
    struct Profile {
        // Content identifiers (IPFS CIDs as bytes32)
        bytes32 animeCid;        // AI-generated avatar
        bytes32 encPhotoCid;     // Encrypted original photo

        // Attested (attestor-only)
        uint8 ageBucket;         // 0=unset, 1=18-24, 2=25-29, 3=30-34, 4=35-39, 5=40-49, 6=50+
        uint8 verifiedLevel;     // 0=none, 1=email, 2=phone, 3=passport

        // User-set (public optional)
        uint8 claimedAgeBucket;  // 0=hidden/unset (useful pre-verification)
        uint8 genderIdentity;    // 0=hidden, else enum (public only)

        // Metadata
        uint32 updatedAt;
        uint8 modelVersion;
        bool exists;
    }

    mapping(address => Profile) public profiles;
    address[] public profileList;

    address public admin;
    address public attestor;

    event ProfileUpdated(address indexed user, uint32 timestamp);
    event ProfileAttested(address indexed user, uint8 ageBucket, uint8 verifiedLevel);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyAttestor() {
        require(msg.sender == attestor, "Only attestor");
        _;
    }

    constructor(address _admin, address _attestor) {
        admin = _admin;
        attestor = _attestor;
    }

    /// @notice Register or update your public profile fields
    /// @dev Attested fields are preserved and can only be changed by attestor.
    function registerOrUpdateProfile(
        bytes32 _animeCid,
        bytes32 _encPhotoCid,
        uint8 _claimedAgeBucket,
        uint8 _genderIdentityPublic,
        uint8 _modelVersion
    ) external {
        bool isNew = !profiles[msg.sender].exists;

        uint8 existingAgeBucket = profiles[msg.sender].ageBucket;
        uint8 existingVerifiedLevel = profiles[msg.sender].verifiedLevel;

        profiles[msg.sender] = Profile({
            animeCid: _animeCid,
            encPhotoCid: _encPhotoCid,
            ageBucket: existingAgeBucket,
            verifiedLevel: existingVerifiedLevel,
            claimedAgeBucket: _claimedAgeBucket,
            genderIdentity: _genderIdentityPublic,
            updatedAt: uint32(block.timestamp),
            modelVersion: _modelVersion,
            exists: true
        });

        if (isNew) profileList.push(msg.sender);
        emit ProfileUpdated(msg.sender, uint32(block.timestamp));
    }

    /// @notice Attestor-only: set verified fields (e.g., after self.xyz)
    function attestProfile(address _user, uint8 _ageBucket, uint8 _verifiedLevel) external onlyAttestor {
        require(profiles[_user].exists, "Profile does not exist");
        require(_ageBucket > 0, "Invalid age bucket");
        require(_verifiedLevel > 0, "Invalid verified level");

        profiles[_user].ageBucket = _ageBucket;
        profiles[_user].verifiedLevel = _verifiedLevel;

        emit ProfileAttested(_user, _ageBucket, _verifiedLevel);
    }

    /// @notice Create minimal profile (attestor convenience)
    function createProfile(address _user) external onlyAttestor {
        require(!profiles[_user].exists, "Profile already exists");

        profiles[_user] = Profile({
            animeCid: bytes32(0),
            encPhotoCid: bytes32(0),
            ageBucket: 0,
            verifiedLevel: 0,
            claimedAgeBucket: 0,
            genderIdentity: 0,
            updatedAt: uint32(block.timestamp),
            modelVersion: 1,
            exists: true
        });

        profileList.push(_user);
        emit ProfileUpdated(_user, uint32(block.timestamp));
    }

    function getProfile(address _user) external view returns (Profile memory) {
        return profiles[_user];
    }

    function getProfileCount() external view returns (uint256) {
        return profileList.length;
    }

    function getProfileAddress(uint256 _index) external view returns (address) {
        require(_index < profileList.length, "Index out of bounds");
        return profileList[_index];
    }

    function isVerified(address _user) external view returns (bool) {
        return profiles[_user].verifiedLevel > 0;
    }

    function setAttestor(address _attestor) external onlyAdmin {
        attestor = _attestor;
    }

    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid admin");
        admin = _newAdmin;
    }
}
