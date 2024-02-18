import { TxOptions } from "../options";
/*
"components": [
          {
            "internalType": "bool",
            "name": "transferable",
            "type": "bool"
          },
          {
            "internalType": "address",
            "name": "royaltyPolicy",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "mintingFee",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "mintingFeeToken",
            "type": "address"
          },
          {
            "components": [
              {
                "internalType": "bool",
                "name": "attribution",
                "type": "bool"
              },
              {
                "internalType": "bool",
                "name": "commercialUse",
                "type": "bool"
              },
              {
                "internalType": "bool",
                "name": "commercialAttribution",
                "type": "bool"
              },
              {
                "internalType": "address",
                "name": "commercializerChecker",
                "type": "address"
              },
              {
                "internalType": "bytes",
                "name": "commercializerCheckerData",
                "type": "bytes"
              },
              {
                "internalType": "uint32",
                "name": "commercialRevShare",
                "type": "uint32"
              },
              {
                "internalType": "bool",
                "name": "derivativesAllowed",
                "type": "bool"
              },
              {
                "internalType": "bool",
                "name": "derivativesAttribution",
                "type": "bool"
              },
              {
                "internalType": "bool",
                "name": "derivativesApproval",
                "type": "bool"
              },
              {
                "internalType": "bool",
                "name": "derivativesReciprocal",
                "type": "bool"
              },
              {
                "internalType": "string[]",
                "name": "territories",
                "type": "string[]"
              },
              {
                "internalType": "string[]",
                "name": "distributionChannels",
                "type": "string[]"
              },
              {
                "internalType": "string[]",
                "name": "contentRestrictions",
                "type": "string[]"
              }
            ],
            "internalType": "struct PILPolicy",
            "name": "policy",
            "type": "tuple"
          }
        ],
        "internalType": "struct RegisterPILPolicyParams",
        "name": "params",
        "type": "tuple"
      }
*/

export type RegisterPILPolicyRequest = {
  transferable: boolean;
  royaltyPolicy?: `0x${string}`;
  mintingFee?: number;
  mintingFeeToken?: `0x${string}`;
  attribution?: boolean;
  commercialUse?: boolean;
  commercialAttribution?: boolean;
  commercialRevShare?: number;
  derivativesAllowed?: boolean;
  derivativesAttribution?: boolean;
  derivativesApproval?: boolean;
  derivativesReciprocal?: boolean;
  territories?: string[];
  distributionChannels?: string[];
  contentRestrictions?: string[];
  commercializerChecker?: `0x${string}`;
  commercializerCheckerData?: string;
  txOptions?: TxOptions;
};

export type RegisterPILPolicyResponse = {
  txHash: string;
  policyId?: string;
};

export type AddPolicyToIpRequest = {
  ipId: string;
  policyId: string;
  txOptions?: TxOptions;
};

export type AddPolicyToIpResponse = {
  txHash: string;
  index?: string;
};
