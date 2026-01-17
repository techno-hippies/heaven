// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Directory - Public profile registry for Noir Date
/// @notice Stores PUBLIC profile data only. Private matching is in DatingV2.sol
/// @dev All fields use 0=hidden encoding for optional visibility
///      Anything stored here is publicly readable on-chain regardless of flags
contract Directory {

    // ============ 0=HIDDEN ENCODING ============
    // All categorical fields use: 0 = hidden/not specified
    // This allows users to choose what's publicly visible
    //
    // Example for smoking:
    //   0 = hidden (not shown in feed)
    //   1 = never
    //   2 = sometimes
    //   3 = regularly
    //
    // If user wants smoking PRIVATE, they set it to 0 here
    // and store the real value in DatingV2 encrypted storage

    struct Profile {
        // Content identifiers (IPFS CIDs as bytes32)
        bytes32 animeCid;           // AI-generated anime avatar
        bytes32 encPhotoCid;        // Encrypted original photo

        // Demographics - ATTESTED (oracle-set, user cannot modify)
        uint8 ageBucket;            // 0=hidden, 1=18-24, 2=25-29, 3=30-34, 4=35-39, 5=40-49, 6=50+
        uint8 verifiedLevel;        // 0=none, 1=email, 2=phone, 3=passport

        // Demographics - USER SET (but public)
        // regionBucket: 0=hidden, 1=North America, 2=Latin America & Caribbean,
        // 3=Europe, 4=Middle East & North Africa, 5=Sub-Saharan Africa,
        // 6=South Asia, 7=East & Southeast Asia, 8=Oceania, 9=Prefer not to say
        uint8 regionBucket;
        uint8 genderIdentity;       // 0=hidden, 1=man, 2=woman, 3=non-binary, 4=trans man, 5=trans woman, etc.
        uint8 bodyBucket;           // 0=hidden, 1-5 body types
        uint8 fitnessBucket;        // 0=hidden, 1-5 fitness levels

        // Lifestyle - PUBLIC OPTIONAL (0=hidden pattern)
        // These are "soft" public filters - Stage 1 uses them
        // Real values live in DatingV2 for private matching
        uint8 smoking;              // 0=hidden, 1=never, 2=sometimes, 3=regularly
        uint8 drinking;             // 0=hidden, 1=never, 2=socially, 3=regularly
        uint8 lookingFor;           // 0=hidden, 1=low-commitment, 2=friends-first, 3=relationship

        // NOT IN DIRECTORY (truly private attributes):
        // - biologicalSex (verified in DatingV2, private by default)
        // - religion, kids, kink, relationship status, group play mode, relationship structure
        // These are SECRET-capable and only live in DatingV2

        // Metadata
        uint32 updatedAt;           // Unix timestamp
        uint8 modelVersion;         // Schema version for upgrades

        bool exists;                // Profile exists flag
    }

    // Storage
    mapping(address => Profile) public profiles;
    address[] public profileList;

    // Admin
    address public admin;
    address public attestor;        // Can set verified_level and ageBucket

    // Events
    event ProfileUpdated(address indexed user, uint32 timestamp);
    event ProfileAttested(address indexed user, uint8 ageBucket, uint8 verifiedLevel);

    constructor(address _admin, address _attestor) {
        admin = _admin;
        attestor = _attestor;
    }

    // ============ MODIFIERS ============

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyAttestor() {
        require(msg.sender == attestor, "Only attestor");
        _;
    }

    // ============ PROFILE MANAGEMENT ============

    /// @notice Register or update your public profile
    /// @dev User cannot set attested fields (ageBucket, verifiedLevel)
    /// @dev All fields use 0=hidden - if user wants private, pass 0
    function registerOrUpdateProfile(
        bytes32 _animeCid,
        bytes32 _encPhotoCid,
        uint8 _regionBucket,
        uint8 _genderIdentity,
        uint8 _bodyBucket,
        uint8 _fitnessBucket,
        uint8 _smoking,
        uint8 _drinking,
        uint8 _lookingFor,
        uint8 _modelVersion
    ) external {
        bool isNew = !profiles[msg.sender].exists;

        // Preserve attested fields if already set
        uint8 existingAgeBucket = profiles[msg.sender].ageBucket;
        uint8 existingVerifiedLevel = profiles[msg.sender].verifiedLevel;

        profiles[msg.sender] = Profile({
            animeCid: _animeCid,
            encPhotoCid: _encPhotoCid,
            ageBucket: existingAgeBucket,           // Preserved (attestor-only)
            verifiedLevel: existingVerifiedLevel,   // Preserved (attestor-only)
            regionBucket: _regionBucket,
            genderIdentity: _genderIdentity,
            bodyBucket: _bodyBucket,
            fitnessBucket: _fitnessBucket,
            smoking: _smoking,
            drinking: _drinking,
            lookingFor: _lookingFor,
            updatedAt: uint32(block.timestamp),
            modelVersion: _modelVersion,
            exists: true
        });

        if (isNew) {
            profileList.push(msg.sender);
        }

        emit ProfileUpdated(msg.sender, uint32(block.timestamp));
    }

    /// @notice Attestor-only: Set verified fields from self.xyz
    /// @dev Called after passport verification
    /// @param _user Wallet to attest
    /// @param _ageBucket Derived from verified age (1-6)
    /// @param _verifiedLevel Verification level achieved (1-3)
    function attestProfile(
        address _user,
        uint8 _ageBucket,
        uint8 _verifiedLevel
    ) external onlyAttestor {
        require(profiles[_user].exists, "Profile does not exist");
        require(_ageBucket > 0, "Invalid age bucket");
        require(_verifiedLevel > 0, "Invalid verified level");

        profiles[_user].ageBucket = _ageBucket;
        profiles[_user].verifiedLevel = _verifiedLevel;

        emit ProfileAttested(_user, _ageBucket, _verifiedLevel);
    }

    /// @notice Create minimal profile (for attestor to set up new users)
    function createProfile(address _user) external onlyAttestor {
        require(!profiles[_user].exists, "Profile already exists");

        profiles[_user] = Profile({
            animeCid: bytes32(0),
            encPhotoCid: bytes32(0),
            ageBucket: 0,
            verifiedLevel: 0,
            regionBucket: 0,
            genderIdentity: 0,
            bodyBucket: 0,
            fitnessBucket: 0,
            smoking: 0,
            drinking: 0,
            lookingFor: 0,
            updatedAt: uint32(block.timestamp),
            modelVersion: 1,
            exists: true
        });

        profileList.push(_user);
    }

    // ============ VIEW FUNCTIONS ============

    /// @notice Get a user's profile
    function getProfile(address _user) external view returns (Profile memory) {
        return profiles[_user];
    }

    /// @notice Get total number of profiles
    function getProfileCount() external view returns (uint256) {
        return profileList.length;
    }

    /// @notice Get profile address by index (for pagination)
    function getProfileAddress(uint256 _index) external view returns (address) {
        require(_index < profileList.length, "Index out of bounds");
        return profileList[_index];
    }

    /// @notice Check if user has verified status
    function isVerified(address _user) external view returns (bool) {
        return profiles[_user].verifiedLevel > 0;
    }

    // ============ ADMIN ============

    function setAttestor(address _attestor) external onlyAdmin {
        attestor = _attestor;
    }

    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid admin");
        admin = _newAdmin;
    }
}
