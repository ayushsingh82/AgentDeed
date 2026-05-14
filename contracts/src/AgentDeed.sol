// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC7857} from "./IERC7857.sol";

/// @notice Verifier for TEE-produced sealed-key envelopes. Implemented by TEEOracle.
interface ITEEOracle {
    function verifyReseal(
        uint256 tokenId,
        bytes32 metadataHash,
        address newOwner,
        bytes calldata sealedKey,
        bytes calldata proof
    ) external view returns (bool);
}

/// @title AgentDeed — ERC-7857 Intelligent NFT for sealed-key model weights
/// @notice Each token points at AES-256-GCM ciphertext on 0G Storage and carries
///         a sealed-key envelope. On transfer/clone the new owner supplies a key
///         re-sealed to them by an attested 0G Compute TEE; if an oracle is wired
///         the contract verifies the TEE proof before moving the token.
contract AgentDeed is IERC7857 {
    string public name;
    string public symbol;

    /// @notice Contract admin — may set the TEE oracle and hand off admin.
    address public admin;
    /// @notice TEE attestation verifier. address(0) => proof checks skipped (testnet).
    address public oracle;

    uint256 private _nextId = 1;

    mapping(uint256 => address) private _ownerOf;
    mapping(address => uint256) private _balanceOf;
    mapping(uint256 => string) private _encryptedURI;
    mapping(uint256 => bytes32) private _metadataHash;
    mapping(uint256 => bytes) private _sealedKey;
    mapping(uint256 => address) private _approved;
    mapping(uint256 => mapping(address => bytes)) private _usage;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event OracleUpdated(address indexed oracle);
    event AdminTransferred(address indexed previousAdmin, address indexed newAdmin);

    error NotAdmin();
    error NotAuthorized();
    error TokenDoesNotExist();
    error InvalidProof();
    error ZeroAddress();
    error WrongFrom();

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    modifier exists(uint256 tokenId) {
        if (_ownerOf[tokenId] == address(0)) revert TokenDoesNotExist();
        _;
    }

    constructor(string memory name_, string memory symbol_) {
        name = name_;
        symbol = symbol_;
        admin = msg.sender;
        emit AdminTransferred(address(0), msg.sender);
    }

    // --- admin ---

    function setOracle(address oracle_) external onlyAdmin {
        oracle = oracle_;
        emit OracleUpdated(oracle_);
    }

    function transferAdmin(address newAdmin) external onlyAdmin {
        if (newAdmin == address(0)) revert ZeroAddress();
        emit AdminTransferred(admin, newAdmin);
        admin = newAdmin;
    }

    // --- ERC-7857 core ---

    function mint(
        address to,
        string calldata encryptedURI,
        bytes32 metadataHash
    ) external returns (uint256 tokenId) {
        if (to == address(0)) revert ZeroAddress();
        tokenId = _nextId++;
        _ownerOf[tokenId] = to;
        unchecked {
            _balanceOf[to] += 1;
        }
        _encryptedURI[tokenId] = encryptedURI;
        _metadataHash[tokenId] = metadataHash;
        emit Transfer(address(0), to, tokenId);
        emit MetadataUpdated(tokenId, metadataHash);
    }

    function transfer(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata sealedKey,
        bytes calldata proof
    ) external exists(tokenId) {
        if (_ownerOf[tokenId] != from) revert WrongFrom();
        if (to == address(0)) revert ZeroAddress();
        if (msg.sender != from && _approved[tokenId] != msg.sender) revert NotAuthorized();

        _verifyReseal(tokenId, _metadataHash[tokenId], to, sealedKey, proof);

        unchecked {
            _balanceOf[from] -= 1;
            _balanceOf[to] += 1;
        }
        _ownerOf[tokenId] = to;
        _sealedKey[tokenId] = sealedKey;
        delete _approved[tokenId];

        emit Transfer(from, to, tokenId);
        emit MetadataUpdated(tokenId, _metadataHash[tokenId]);
    }

    function clone(
        address to,
        uint256 tokenId,
        bytes calldata sealedKey,
        bytes calldata proof
    ) external exists(tokenId) returns (uint256 newTokenId) {
        if (msg.sender != _ownerOf[tokenId]) revert NotAuthorized();
        if (to == address(0)) revert ZeroAddress();

        bytes32 mh = _metadataHash[tokenId];
        _verifyReseal(tokenId, mh, to, sealedKey, proof);

        newTokenId = _nextId++;
        _ownerOf[newTokenId] = to;
        unchecked {
            _balanceOf[to] += 1;
        }
        _encryptedURI[newTokenId] = _encryptedURI[tokenId];
        _metadataHash[newTokenId] = mh;
        _sealedKey[newTokenId] = sealedKey;

        emit Transfer(address(0), to, newTokenId);
        emit MetadataUpdated(newTokenId, mh);
    }

    function authorizeUsage(
        uint256 tokenId,
        address executor,
        bytes calldata permissions
    ) external exists(tokenId) {
        if (msg.sender != _ownerOf[tokenId]) revert NotAuthorized();
        _usage[tokenId][executor] = permissions;
        emit UsageAuthorized(tokenId, executor);
    }

    function approve(address to, uint256 tokenId) external exists(tokenId) {
        if (msg.sender != _ownerOf[tokenId]) revert NotAuthorized();
        _approved[tokenId] = to;
        emit Approval(msg.sender, to, tokenId);
    }

    // --- views ---

    function getMetadataHash(uint256 tokenId)
        external
        view
        exists(tokenId)
        returns (bytes32)
    {
        return _metadataHash[tokenId];
    }

    function getEncryptedURI(uint256 tokenId)
        external
        view
        exists(tokenId)
        returns (string memory)
    {
        return _encryptedURI[tokenId];
    }

    /// @notice The key envelope sealed to the token's current owner.
    function getSealedKey(uint256 tokenId)
        external
        view
        exists(tokenId)
        returns (bytes memory)
    {
        return _sealedKey[tokenId];
    }

    function usagePermissions(uint256 tokenId, address executor)
        external
        view
        returns (bytes memory)
    {
        return _usage[tokenId][executor];
    }

    function ownerOf(uint256 tokenId) external view exists(tokenId) returns (address) {
        return _ownerOf[tokenId];
    }

    function balanceOf(address owner) external view returns (uint256) {
        if (owner == address(0)) revert ZeroAddress();
        return _balanceOf[owner];
    }

    function getApproved(uint256 tokenId) external view returns (address) {
        return _approved[tokenId];
    }

    /// @notice Highest minted token id (ids start at 1, never reused).
    function totalSupply() external view returns (uint256) {
        return _nextId - 1;
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        // ERC-165 + ERC-721 base interface advertisement.
        return interfaceId == 0x01ffc9a7 || interfaceId == 0x80ac58cd;
    }

    // --- internal ---

    function _verifyReseal(
        uint256 tokenId,
        bytes32 metadataHash,
        address newOwner,
        bytes calldata sealedKey,
        bytes calldata proof
    ) internal view {
        // Testnet convenience: with no oracle wired, transfers run permissionlessly.
        if (oracle == address(0)) return;
        if (
            !ITEEOracle(oracle).verifyReseal(
                tokenId,
                metadataHash,
                newOwner,
                sealedKey,
                proof
            )
        ) {
            revert InvalidProof();
        }
    }
}
