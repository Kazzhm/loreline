// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ContributionReceiptRegistry} from "../contracts/ContributionReceiptRegistry.sol";

contract ReceiptActor {
    function issue(
        ContributionReceiptRegistry registry,
        address contributor,
        bytes32 contentDigest,
        bytes32 agreementDigest
    ) external returns (bytes32) {
        return registry.issueReceipt(contributor, contentDigest, agreementDigest);
    }
}

contract ContributionReceiptRegistryTest {
    ContributionReceiptRegistry private registry;
    address private constant CONTRIBUTOR = address(0xBEEF);
    bytes32 private constant CONTENT_DIGEST = keccak256("accepted contribution");
    bytes32 private constant AGREEMENT_DIGEST = keccak256("creator approval terms v1");

    function setUp() public {
        registry = new ContributionReceiptRegistry();
    }

    function testCreatorSignatureBecomesReceiptAuthority() public {
        bytes32 receiptId = registry.issueReceipt(
            CONTRIBUTOR,
            CONTENT_DIGEST,
            AGREEMENT_DIGEST
        );

        (
            address creator,
            address contributor,
            bytes32 contentDigest,
            bytes32 agreementDigest,
            uint64 issuedAt
        ) = registry.receipts(receiptId);

        require(creator == address(this), "creator must be transaction sender");
        require(contributor == CONTRIBUTOR, "contributor mismatch");
        require(contentDigest == CONTENT_DIGEST, "content digest mismatch");
        require(agreementDigest == AGREEMENT_DIGEST, "agreement digest mismatch");
        require(issuedAt != 0, "receipt timestamp missing");
        require(
            registry.verifyReceipt(
                receiptId,
                creator,
                contributor,
                contentDigest,
                agreementDigest
            ),
            "receipt should verify"
        );
    }

    function testDuplicateReceiptIsRejected() public {
        registry.issueReceipt(CONTRIBUTOR, CONTENT_DIGEST, AGREEMENT_DIGEST);

        bool rejected;
        try registry.issueReceipt(CONTRIBUTOR, CONTENT_DIGEST, AGREEMENT_DIGEST) {
            rejected = false;
        } catch (bytes memory reason) {
            rejected = _selector(reason) == ContributionReceiptRegistry.DuplicateReceipt.selector;
        }
        require(rejected, "duplicate receipt must revert");
    }

    function testEmptyContentDigestIsRejected() public {
        bool rejected;
        try registry.issueReceipt(CONTRIBUTOR, bytes32(0), AGREEMENT_DIGEST) {
            rejected = false;
        } catch (bytes memory reason) {
            rejected = _selector(reason) == ContributionReceiptRegistry.EmptyDigest.selector;
        }
        require(rejected, "empty content digest must revert");
    }

    function testDifferentCreatorsProduceDifferentReceipts() public {
        bytes32 first = registry.issueReceipt(
            CONTRIBUTOR,
            CONTENT_DIGEST,
            AGREEMENT_DIGEST
        );
        ReceiptActor secondCreator = new ReceiptActor();
        bytes32 second = secondCreator.issue(
            registry,
            CONTRIBUTOR,
            CONTENT_DIGEST,
            AGREEMENT_DIGEST
        );

        require(first != second, "creator identity must affect receipt ID");
    }

    function testTamperedAgreementDoesNotVerify() public {
        bytes32 receiptId = registry.issueReceipt(
            CONTRIBUTOR,
            CONTENT_DIGEST,
            AGREEMENT_DIGEST
        );

        require(
            !registry.verifyReceipt(
                receiptId,
                address(this),
                CONTRIBUTOR,
                CONTENT_DIGEST,
                keccak256("different terms")
            ),
            "changed terms must not verify"
        );
    }

    function _selector(bytes memory reason) private pure returns (bytes4 result) {
        if (reason.length < 4) return bytes4(0);
        assembly {
            result := mload(add(reason, 32))
        }
    }
}
