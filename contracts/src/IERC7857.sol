// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IERC7857 — Intelligent NFT (encrypted, re-encryptable metadata)
/// @notice Interface surface consumed by the AgentDeed app (`src/lib/og.ts`).
///         An INFT carries an encrypted-weights URI plus a per-owner sealed-key
///         envelope; the key is re-sealed to the new owner on every transfer.
interface IERC7857 {
    /// @notice Emitted when a token's metadata hash is (re)bound — mint, transfer, clone.
    event MetadataUpdated(uint256 indexed tokenId, bytes32 newHash);

    /// @notice Emitted when an owner grants an executor permission to run inference.
    event UsageAuthorized(uint256 indexed tokenId, address indexed executor);

    /// @notice Mint a fresh INFT pointing at encrypted weights on 0G Storage.
    /// @param to            Recipient / first owner.
    /// @param encryptedURI  0G Storage root hash or URI of the AES-GCM ciphertext.
    /// @param metadataHash  SHA-256 (bytes32) of the ciphertext — the content address.
    /// @return tokenId      Newly minted token id.
    function mint(
        address to,
        string calldata encryptedURI,
        bytes32 metadataHash
    ) external returns (uint256 tokenId);

    /// @notice Transfer a token and hand over a key envelope sealed to `to`.
    /// @param sealedKey  AES key re-encrypted to the recipient's pubkey by the TEE.
    /// @param proof      TEE attestation proof that `sealedKey` is a valid re-seal.
    function transfer(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata sealedKey,
        bytes calldata proof
    ) external;

    /// @notice Clone a token's weights into a new token owned by `to`.
    /// @return newTokenId  The minted clone's token id.
    function clone(
        address to,
        uint256 tokenId,
        bytes calldata sealedKey,
        bytes calldata proof
    ) external returns (uint256 newTokenId);

    /// @notice Grant `executor` permission to run inference for `tokenId`.
    /// @param permissions  Opaque permission blob interpreted off-chain by the TEE.
    function authorizeUsage(
        uint256 tokenId,
        address executor,
        bytes calldata permissions
    ) external;

    function getMetadataHash(uint256 tokenId) external view returns (bytes32);

    function getEncryptedURI(uint256 tokenId) external view returns (string memory);

    function ownerOf(uint256 tokenId) external view returns (address);

    function balanceOf(address owner) external view returns (uint256);
}
