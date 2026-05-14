// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title TEEOracle — verifies sealed-key envelopes were produced by an attested TEE
/// @notice AgentDeed.transfer / clone call `verifyReseal`. The 0G Compute TEE signs
///         a digest binding (tokenId, metadataHash, newOwner, hash(sealedKey)) with
///         its attested signing key; this oracle holds the set of trusted signers.
contract TEEOracle {
    address public admin;
    mapping(address => bool) public attestedSigner;

    event SignerSet(address indexed signer, bool attested);
    event AdminTransferred(address indexed previousAdmin, address indexed newAdmin);

    error NotAdmin();
    error ZeroAddress();

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    constructor() {
        admin = msg.sender;
        emit AdminTransferred(address(0), msg.sender);
    }

    function setSigner(address signer, bool attested) external onlyAdmin {
        if (signer == address(0)) revert ZeroAddress();
        attestedSigner[signer] = attested;
        emit SignerSet(signer, attested);
    }

    function transferAdmin(address newAdmin) external onlyAdmin {
        if (newAdmin == address(0)) revert ZeroAddress();
        emit AdminTransferred(admin, newAdmin);
        admin = newAdmin;
    }

    /// @notice The digest the TEE must sign for a given re-seal.
    function resealDigest(
        uint256 tokenId,
        bytes32 metadataHash,
        address newOwner,
        bytes calldata sealedKey
    ) public pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    tokenId,
                    metadataHash,
                    newOwner,
                    keccak256(sealedKey)
                )
            );
    }

    /// @notice True iff `proof` is an EIP-191 signature over `resealDigest` by a
    ///         currently-attested TEE signer.
    function verifyReseal(
        uint256 tokenId,
        bytes32 metadataHash,
        address newOwner,
        bytes calldata sealedKey,
        bytes calldata proof
    ) external view returns (bool) {
        bytes32 digest = resealDigest(tokenId, metadataHash, newOwner, sealedKey);
        bytes32 ethSigned = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", digest)
        );
        address signer = _recover(ethSigned, proof);
        return signer != address(0) && attestedSigner[signer];
    }

    function _recover(bytes32 hash, bytes calldata sig)
        internal
        pure
        returns (address)
    {
        if (sig.length != 65) return address(0);
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := calldataload(sig.offset)
            s := calldataload(add(sig.offset, 32))
            v := byte(0, calldataload(add(sig.offset, 64)))
        }
        if (v < 27) v += 27;
        if (v != 27 && v != 28) return address(0);
        // Reject malleable high-s signatures.
        if (
            uint256(s) >
            0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0
        ) {
            return address(0);
        }
        return ecrecover(hash, v, r, s);
    }
}
