// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ContributionReceiptRegistry
/// @notice Records creator-signed approval and attribution evidence without storing private work.
contract ContributionReceiptRegistry {
    struct Receipt {
        address creator;
        address contributor;
        bytes32 contentDigest;
        bytes32 agreementDigest;
        uint64 issuedAt;
    }

    error EmptyDigest();
    error DuplicateReceipt(bytes32 receiptId);

    event ContributionReceiptIssued(
        bytes32 indexed receiptId,
        address indexed creator,
        address indexed contributor,
        bytes32 contentDigest,
        bytes32 agreementDigest,
        uint64 issuedAt
    );

    mapping(bytes32 receiptId => Receipt receipt) public receipts;

    function computeReceiptId(
        address creator,
        address contributor,
        bytes32 contentDigest,
        bytes32 agreementDigest
    ) public pure returns (bytes32) {
        return keccak256(abi.encode(creator, contributor, contentDigest, agreementDigest));
    }

    function issueReceipt(
        address contributor,
        bytes32 contentDigest,
        bytes32 agreementDigest
    ) external returns (bytes32 receiptId) {
        if (contentDigest == bytes32(0) || agreementDigest == bytes32(0)) {
            revert EmptyDigest();
        }

        receiptId = computeReceiptId(
            msg.sender,
            contributor,
            contentDigest,
            agreementDigest
        );
        if (receipts[receiptId].issuedAt != 0) {
            revert DuplicateReceipt(receiptId);
        }

        uint64 issuedAt = uint64(block.timestamp);
        receipts[receiptId] = Receipt({
            creator: msg.sender,
            contributor: contributor,
            contentDigest: contentDigest,
            agreementDigest: agreementDigest,
            issuedAt: issuedAt
        });

        emit ContributionReceiptIssued(
            receiptId,
            msg.sender,
            contributor,
            contentDigest,
            agreementDigest,
            issuedAt
        );
    }

    function verifyReceipt(
        bytes32 receiptId,
        address creator,
        address contributor,
        bytes32 contentDigest,
        bytes32 agreementDigest
    ) external view returns (bool) {
        Receipt memory receipt = receipts[receiptId];
        return
            receipt.issuedAt != 0 &&
            receipt.creator == creator &&
            receipt.contributor == contributor &&
            receipt.contentDigest == contentDigest &&
            receipt.agreementDigest == agreementDigest;
    }
}
