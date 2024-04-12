export default [
  {
    inputs: [
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "AccessControlled__CallerIsNotIpAccount",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ipAccount",
        type: "address",
      },
    ],
    name: "AccessControlled__NotIpAccount",
    type: "error",
  },
  {
    inputs: [],
    name: "AccessControlled__ZeroAddress",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "signer",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "AccessController__BothCallerAndRecipientAreNotRegisteredModule",
    type: "error",
  },
  {
    inputs: [],
    name: "AccessController__CallerIsNotIPAccount",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ipAccount",
        type: "address",
      },
    ],
    name: "AccessController__IPAccountIsNotValid",
    type: "error",
  },
  {
    inputs: [],
    name: "AccessController__IPAccountIsZeroAddress",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ipAccount",
        type: "address",
      },
      {
        internalType: "address",
        name: "signer",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "bytes4",
        name: "func",
        type: "bytes4",
      },
    ],
    name: "AccessController__PermissionDenied",
    type: "error",
  },
  {
    inputs: [],
    name: "AccessController__PermissionIsNotValid",
    type: "error",
  },
  {
    inputs: [],
    name: "AccessController__SignerIsZeroAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "ArbitrationPolicySP__NotDisputeModule",
    type: "error",
  },
  {
    inputs: [],
    name: "ArbitrationPolicySP__ZeroDisputeModule",
    type: "error",
  },
  {
    inputs: [],
    name: "ArbitrationPolicySP__ZeroPaymentToken",
    type: "error",
  },
  {
    inputs: [],
    name: "CoreMetadataModule__MetadataAlreadyFrozen",
    type: "error",
  },
  {
    inputs: [],
    name: "DisputeModule__NotAbleToResolve",
    type: "error",
  },
  {
    inputs: [],
    name: "DisputeModule__NotDisputeInitiator",
    type: "error",
  },
  {
    inputs: [],
    name: "DisputeModule__NotInDisputeState",
    type: "error",
  },
  {
    inputs: [],
    name: "DisputeModule__NotRegisteredIpId",
    type: "error",
  },
  {
    inputs: [],
    name: "DisputeModule__NotWhitelistedArbitrationPolicy",
    type: "error",
  },
  {
    inputs: [],
    name: "DisputeModule__NotWhitelistedArbitrationRelayer",
    type: "error",
  },
  {
    inputs: [],
    name: "DisputeModule__NotWhitelistedDisputeTag",
    type: "error",
  },
  {
    inputs: [],
    name: "DisputeModule__ZeroArbitrationPolicy",
    type: "error",
  },
  {
    inputs: [],
    name: "DisputeModule__ZeroArbitrationRelayer",
    type: "error",
  },
  {
    inputs: [],
    name: "DisputeModule__ZeroDisputeTag",
    type: "error",
  },
  {
    inputs: [],
    name: "DisputeModule__ZeroLinkToDisputeEvidence",
    type: "error",
  },
  {
    inputs: [],
    name: "IPAccountRegistry_InvalidIpAccountImpl",
    type: "error",
  },
  {
    inputs: [],
    name: "IPAccount__ExpiredSignature",
    type: "error",
  },
  {
    inputs: [],
    name: "IPAccount__InvalidAccessController",
    type: "error",
  },
  {
    inputs: [],
    name: "IPAccount__InvalidCalldata",
    type: "error",
  },
  {
    inputs: [],
    name: "IPAccount__InvalidSignature",
    type: "error",
  },
  {
    inputs: [],
    name: "IPAccount__InvalidSigner",
    type: "error",
  },
  {
    inputs: [],
    name: "IPAssetRegistry__AlreadyRegistered",
    type: "error",
  },
  {
    inputs: [],
    name: "IPAssetRegistry__IPAccountAlreadyCreated",
    type: "error",
  },
  {
    inputs: [],
    name: "IPAssetRegistry__InvalidAccount",
    type: "error",
  },
  {
    inputs: [],
    name: "IPAssetRegistry__InvalidMetadataProvider",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "contractAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "IPAssetRegistry__InvalidToken",
    type: "error",
  },
  {
    inputs: [],
    name: "IPAssetRegistry__NotYetRegistered",
    type: "error",
  },
  {
    inputs: [],
    name: "IPAssetRegistry__RegistrantUnauthorized",
    type: "error",
  },
  {
    inputs: [],
    name: "IPAssetRegistry__ResolverInvalid",
    type: "error",
  },
  {
    inputs: [],
    name: "IPAssetRegistry__Unauthorized",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "contractAddress",
        type: "address",
      },
    ],
    name: "IPAssetRegistry__UnsupportedIERC721",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "contractAddress",
        type: "address",
      },
    ],
    name: "IPAssetRegistry__UnsupportedIERC721Metadata",
    type: "error",
  },
  {
    inputs: [],
    name: "IPResolver_InvalidIP",
    type: "error",
  },
  {
    inputs: [],
    name: "IPResolver_Unauthorized",
    type: "error",
  },
  {
    inputs: [],
    name: "IpRoyaltyVault__AlreadyClaimed",
    type: "error",
  },
  {
    inputs: [],
    name: "IpRoyaltyVault__ClaimerNotAnAncestor",
    type: "error",
  },
  {
    inputs: [],
    name: "IpRoyaltyVault__IpTagged",
    type: "error",
  },
  {
    inputs: [],
    name: "IpRoyaltyVault__NotRoyaltyPolicyLAP",
    type: "error",
  },
  {
    inputs: [],
    name: "IpRoyaltyVault__SnapshotIntervalTooShort",
    type: "error",
  },
  {
    inputs: [],
    name: "IpRoyaltyVault__ZeroDisputeModule",
    type: "error",
  },
  {
    inputs: [],
    name: "IpRoyaltyVault__ZeroIpId",
    type: "error",
  },
  {
    inputs: [],
    name: "IpRoyaltyVault__ZeroRoyaltyPolicyLAP",
    type: "error",
  },
  {
    inputs: [],
    name: "LicenseRegistry__CallerNotLicensingModule",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "childIpId",
        type: "address",
      },
    ],
    name: "LicenseRegistry__DerivativeAlreadyRegistered",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "childIpId",
        type: "address",
      },
    ],
    name: "LicenseRegistry__DerivativeIpAlreadyHasLicense",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ipId",
        type: "address",
      },
    ],
    name: "LicenseRegistry__DerivativeIsParent",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ipId",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "length",
        type: "uint256",
      },
    ],
    name: "LicenseRegistry__IndexOutOfBounds",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ipId",
        type: "address",
      },
    ],
    name: "LicenseRegistry__IpExpired",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ipId",
        type: "address",
      },
      {
        internalType: "address",
        name: "licenseTemplate",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "licenseTermsId",
        type: "uint256",
      },
    ],
    name: "LicenseRegistry__LicenseTermsAlreadyAttached",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "licenseTemplate",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "licenseTermsId",
        type: "uint256",
      },
    ],
    name: "LicenseRegistry__LicenseTermsNotExists",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ipId",
        type: "address",
      },
      {
        internalType: "address",
        name: "licenseTemplate",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "licenseTermsId",
        type: "uint256",
      },
    ],
    name: "LicenseRegistry__LicensorIpHasNoLicenseTerms",
    type: "error",
  },
  {
    inputs: [],
    name: "LicenseRegistry__NoParentIp",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "licenseTemplate",
        type: "address",
      },
    ],
    name: "LicenseRegistry__NotLicenseTemplate",
    type: "error",
  },
  {
    inputs: [],
    name: "LicenseRegistry__NotTransferable",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ipId",
        type: "address",
      },
    ],
    name: "LicenseRegistry__ParentIpExpired",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ipId",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "licenseTermsId",
        type: "uint256",
      },
    ],
    name: "LicenseRegistry__ParentIpHasNoLicenseTerms",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ipId",
        type: "address",
      },
    ],
    name: "LicenseRegistry__ParentIpTagged",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ipId",
        type: "address",
      },
      {
        internalType: "address",
        name: "licenseTemplate",
        type: "address",
      },
    ],
    name: "LicenseRegistry__ParentIpUnmachedLicenseTemplate",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ipId",
        type: "address",
      },
      {
        internalType: "address",
        name: "licenseTemplate",
        type: "address",
      },
      {
        internalType: "address",
        name: "newLicenseTemplate",
        type: "address",
      },
    ],
    name: "LicenseRegistry__UnmatchedLicenseTemplate",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "licenseTemplate",
        type: "address",
      },
    ],
    name: "LicenseRegistry__UnregisteredLicenseTemplate",
    type: "error",
  },
  {
    inputs: [],
    name: "LicenseRegistry__ZeroDisputeModule",
    type: "error",
  },
  {
    inputs: [],
    name: "LicenseRegistry__ZeroLicensingModule",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "licenseTemplate",
        type: "address",
      },
      {
        internalType: "address",
        name: "anotherLicenseTemplate",
        type: "address",
      },
    ],
    name: "LicenseToken__AllLicenseTokensMustFromSameLicenseTemplate",
    type: "error",
  },
  {
    inputs: [],
    name: "LicenseToken__CallerNotLicensingModule",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "expiredAt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "currentTimestamp",
        type: "uint256",
      },
    ],
    name: "LicenseToken__LicenseTokenExpired",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "iPowner",
        type: "address",
      },
      {
        internalType: "address",
        name: "tokenOwner",
        type: "address",
      },
    ],
    name: "LicenseToken__NotLicenseTokenOwner",
    type: "error",
  },
  {
    inputs: [],
    name: "LicenseToken__NotTransferable",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "LicenseToken__RevokedLicense",
    type: "error",
  },
  {
    inputs: [],
    name: "LicenseToken__ZeroDisputeModule",
    type: "error",
  },
  {
    inputs: [],
    name: "LicenseToken__ZeroLicensingModule",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__CallerNotLicenseRegistry",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
      {
        internalType: "address",
        name: "licensorIpId",
        type: "address",
      },
      {
        internalType: "address",
        name: "licenseTemplate",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "licenseTermsId",
        type: "uint256",
      },
    ],
    name: "LicensingModule__CallerNotLicensorAndIpHasNotAttachedLicenseTerms",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__CallerNotLicensorAndPolicyNotSet",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__CommercialTermInNonCommercialPolicy",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ipId",
        type: "address",
      },
    ],
    name: "LicensingModule__DerivativeAlreadyHasLicenseTerms",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__DerivativeAlreadyRegistered",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__DerivativeIsParent",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__DerivativeRevShareSumExceedsMaxRNFTSupply",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__DerivativesCannotAddLicenseTerms",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__DerivativesCannotAddPolicy",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__DisputedIpId",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__EmptyLicenseUrl",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__EmptyParamName",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__FrameworkNotFound",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__IncompatibleLicensorRoyaltyDerivativeRevShare",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "royaltyPolicy",
        type: "address",
      },
      {
        internalType: "address",
        name: "anotherRoyaltyPolicy",
        type: "address",
      },
    ],
    name: "LicensingModule__IncompatibleRoyaltyPolicy",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__IncompatibleRoyaltyPolicyAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__IncompatibleRoyaltyPolicyDerivativeRevShare",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__InvalidLicensor",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__InvalidPolicyFramework",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__IpAlreadyLinked",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "licenseTemplate",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "licenseTermsId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "licensorIpId",
        type: "address",
      },
    ],
    name: "LicensingModule__LicenseDenyMintLicenseToken",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "childIpId",
        type: "address",
      },
    ],
    name: "LicensingModule__LicenseNotCompatibleForDerivative",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "ipLength",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "licenseTermsLength",
        type: "uint256",
      },
    ],
    name: "LicensingModule__LicenseTermsLengthMismatch",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "licenseTemplate",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "licenseTermsId",
        type: "uint256",
      },
    ],
    name: "LicensingModule__LicenseTermsNotFound",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "childIpId",
        type: "address",
      },
      {
        internalType: "uint256[]",
        name: "licenseTokenIds",
        type: "uint256[]",
      },
    ],
    name: "LicensingModule__LicenseTokenNotCompatibleForDerivative",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__LicensorDoesntHaveThisPolicy",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__LicensorNotRegistered",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__LinkParentParamFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__LinkingRevokedLicense",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__MintAmountZero",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__MintLicenseParamFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__MintingFeeTokenNotWhitelisted",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__MismatchBetweenRoyaltyPolicy",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__NoLicenseToken",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__NoParentIp",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__NotLicensee",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__ParamVerifierAlreadySet",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__ParamVerifierLengthMismatch",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__ParentIdEqualThanChild",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ipId",
        type: "address",
      },
    ],
    name: "LicensingModule__ParentIpHasNoLicenseTerms",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__PolicyAlreadySetForIpId",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__PolicyNotFound",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "LicensingModule__ReceiverCheckFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__ReceiverZeroAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__RegisterPolicyFrameworkMismatch",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__RoyaltyPolicyNotWhitelisted",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__TransferParamFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__UnauthorizedAccess",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensingModule__UnregisteredFrameworkAddingPolicy",
    type: "error",
  },
  {
    inputs: [],
    name: "LicensorApprovalChecker__Unauthorized",
    type: "error",
  },
  {
    inputs: [],
    name: "MetadataProvider__HashInvalid",
    type: "error",
  },
  {
    inputs: [],
    name: "MetadataProvider__IPAssetOwnerInvalid",
    type: "error",
  },
  {
    inputs: [],
    name: "MetadataProvider__MetadataNotCompatible",
    type: "error",
  },
  {
    inputs: [],
    name: "MetadataProvider__NameInvalid",
    type: "error",
  },
  {
    inputs: [],
    name: "MetadataProvider__RegistrantInvalid",
    type: "error",
  },
  {
    inputs: [],
    name: "MetadataProvider__RegistrationDateInvalid",
    type: "error",
  },
  {
    inputs: [],
    name: "MetadataProvider__URIInvalid",
    type: "error",
  },
  {
    inputs: [],
    name: "MetadataProvider__Unauthorized",
    type: "error",
  },
  {
    inputs: [],
    name: "MetadataProvider__UpgradeProviderInvalid",
    type: "error",
  },
  {
    inputs: [],
    name: "MetadataProvider__UpgradeUnavailable",
    type: "error",
  },
  {
    inputs: [],
    name: "ModuleRegistry__InterfaceIdZero",
    type: "error",
  },
  {
    inputs: [],
    name: "ModuleRegistry__ModuleAddressNotContract",
    type: "error",
  },
  {
    inputs: [],
    name: "ModuleRegistry__ModuleAddressZeroAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "ModuleRegistry__ModuleAlreadyRegistered",
    type: "error",
  },
  {
    inputs: [],
    name: "ModuleRegistry__ModuleNotRegistered",
    type: "error",
  },
  {
    inputs: [],
    name: "ModuleRegistry__ModuleNotSupportExpectedModuleTypeInterfaceId",
    type: "error",
  },
  {
    inputs: [],
    name: "ModuleRegistry__ModuleTypeAlreadyRegistered",
    type: "error",
  },
  {
    inputs: [],
    name: "ModuleRegistry__ModuleTypeEmptyString",
    type: "error",
  },
  {
    inputs: [],
    name: "ModuleRegistry__ModuleTypeNotRegistered",
    type: "error",
  },
  {
    inputs: [],
    name: "ModuleRegistry__NameAlreadyRegistered",
    type: "error",
  },
  {
    inputs: [],
    name: "ModuleRegistry__NameDoesNotMatch",
    type: "error",
  },
  {
    inputs: [],
    name: "ModuleRegistry__NameEmptyString",
    type: "error",
  },
  {
    inputs: [],
    name: "Module_Unauthorized",
    type: "error",
  },
  {
    inputs: [],
    name: "RoyaltyModule__CanOnlyMintSelectedPolicy",
    type: "error",
  },
  {
    inputs: [],
    name: "RoyaltyModule__IncompatibleRoyaltyPolicy",
    type: "error",
  },
  {
    inputs: [],
    name: "RoyaltyModule__IpIsTagged",
    type: "error",
  },
  {
    inputs: [],
    name: "RoyaltyModule__NoParentsOnLinking",
    type: "error",
  },
  {
    inputs: [],
    name: "RoyaltyModule__NoRoyaltyPolicySet",
    type: "error",
  },
  {
    inputs: [],
    name: "RoyaltyModule__NotAllowedCaller",
    type: "error",
  },
  {
    inputs: [],
    name: "RoyaltyModule__NotWhitelistedRoyaltyPolicy",
    type: "error",
  },
  {
    inputs: [],
    name: "RoyaltyModule__NotWhitelistedRoyaltyToken",
    type: "error",
  },
  {
    inputs: [],
    name: "RoyaltyModule__ZeroDisputeModule",
    type: "error",
  },
  {
    inputs: [],
    name: "RoyaltyModule__ZeroLicensingModule",
    type: "error",
  },
  {
    inputs: [],
    name: "RoyaltyModule__ZeroRoyaltyPolicy",
    type: "error",
  },
  {
    inputs: [],
    name: "RoyaltyModule__ZeroRoyaltyToken",
    type: "error",
  },
  {
    inputs: [],
    name: "RoyaltyPolicyLAP__AboveAncestorsLimit",
    type: "error",
  },
  {
    inputs: [],
    name: "RoyaltyPolicyLAP__AboveParentLimit",
    type: "error",
  },
  {
    inputs: [],
    name: "RoyaltyPolicyLAP__AboveRoyaltyStackLimit",
    type: "error",
  },
  {
    inputs: [],
    name: "RoyaltyPolicyLAP__ImplementationAlreadySet",
    type: "error",
  },
  {
    inputs: [],
    name: "RoyaltyPolicyLAP__InvalidParentRoyaltiesLength",
    type: "error",
  },
  {
    inputs: [],
    name: "RoyaltyPolicyLAP__LastPositionNotAbleToMintLicense",
    type: "error",
  },
  {
    inputs: [],
    name: "RoyaltyPolicyLAP__NotFullOwnership",
    type: "error",
  },
  {
    inputs: [],
    name: "RoyaltyPolicyLAP__NotRoyaltyModule",
    type: "error",
  },
  {
    inputs: [],
    name: "RoyaltyPolicyLAP__UnlinkableToParents",
    type: "error",
  },
  {
    inputs: [],
    name: "RoyaltyPolicyLAP__ZeroAncestorsVaultImpl",
    type: "error",
  },
  {
    inputs: [],
    name: "RoyaltyPolicyLAP__ZeroIpRoyaltyVaultBeacon",
    type: "error",
  },
  {
    inputs: [],
    name: "RoyaltyPolicyLAP__ZeroLicensingModule",
    type: "error",
  },
  {
    inputs: [],
    name: "RoyaltyPolicyLAP__ZeroLiquidSplitFactory",
    type: "error",
  },
  {
    inputs: [],
    name: "RoyaltyPolicyLAP__ZeroLiquidSplitMain",
    type: "error",
  },
  {
    inputs: [],
    name: "RoyaltyPolicyLAP__ZeroRoyaltyModule",
    type: "error",
  },
] as const;
