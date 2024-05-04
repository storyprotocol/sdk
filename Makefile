.PHONY: compile_contracts

compile_contracts:
	rm -rf packages/core-sdk/src/abi/json/tmp

	git submodule add -b release-v1.x.x --force https://github.com/storyprotocol/protocol-core-v1 packages/core-sdk/protocol-core-contracts
	git submodule add -b release-v1.x.x --force https://github.com/storyprotocol/protocol-periphery-v1 packages/core-sdk/protocol-periphery-contracts
	git submodule update --remote --merge

	cd packages/core-sdk/protocol-core-contracts && yarn install 

	solc @erc6551/=node_modules/erc6551/ --pretty-json --base-path packages/core-sdk/protocol-core-contracts --include-path packages/core-sdk/protocol-core-contracts/node_modules/ --abi packages/core-sdk/protocol-core-contracts/contracts/IPAccountImpl.sol -o packages/core-sdk/src/abi/json/tmp/IPAccountImpl
	solc @erc6551/=node_modules/erc6551/ --pretty-json --base-path packages/core-sdk/protocol-core-contracts --include-path packages/core-sdk/protocol-core-contracts/node_modules/ --abi packages/core-sdk/protocol-core-contracts/contracts/access/AccessController.sol -o packages/core-sdk/src/abi/json/tmp/AccessController
	solc @erc6551/=node_modules/erc6551/ --pretty-json --base-path packages/core-sdk/protocol-core-contracts --include-path packages/core-sdk/protocol-core-contracts/node_modules/ --abi packages/core-sdk/protocol-core-contracts/contracts/modules/dispute/DisputeModule.sol -o packages/core-sdk/src/abi/json/tmp/DisputeModule
	solc @erc6551/=node_modules/erc6551/ --pretty-json --base-path packages/core-sdk/protocol-core-contracts --include-path packages/core-sdk/protocol-core-contracts/node_modules/ --abi packages/core-sdk/protocol-core-contracts/contracts/modules/licensing/LicensingModule.sol -o packages/core-sdk/src/abi/json/tmp/LicensingModule
	solc @erc6551/=node_modules/erc6551/ --pretty-json --base-path packages/core-sdk/protocol-core-contracts --include-path packages/core-sdk/protocol-core-contracts/node_modules/ --abi packages/core-sdk/protocol-core-contracts/contracts/modules/royalty/policies/IpRoyaltyVault.sol -o packages/core-sdk/src/abi/json/tmp/Royalty
	solc @erc6551/=node_modules/erc6551/ --pretty-json --base-path packages/core-sdk/protocol-core-contracts --include-path packages/core-sdk/protocol-core-contracts/node_modules/ --abi packages/core-sdk/protocol-core-contracts/contracts/interfaces/registries/IIPAssetRegistry.sol -o packages/core-sdk/src/abi/json/tmp/IIPAssetRegistry
	solc @erc6551/=node_modules/erc6551/ --pretty-json --base-path packages/core-sdk/protocol-core-contracts --include-path packages/core-sdk/protocol-core-contracts/node_modules/ --abi packages/core-sdk/protocol-core-contracts/contracts/registries/LicenseRegistry.sol -o packages/core-sdk/src/abi/json/tmp/LicenseRegistry
	solc @erc6551/=node_modules/erc6551/ --pretty-json --base-path packages/core-sdk/protocol-core-contracts --include-path packages/core-sdk/protocol-core-contracts/node_modules/ --abi packages/core-sdk/protocol-core-contracts/contracts/registries/IPAssetRegistry.sol -o packages/core-sdk/src/abi/json/tmp/IPAssetRegistry
	solc @erc6551/=node_modules/erc6551/ --pretty-json --base-path packages/core-sdk/protocol-core-contracts --include-path packages/core-sdk/protocol-core-contracts/node_modules/ --abi packages/core-sdk/protocol-core-contracts/contracts/modules/licensing/PILicenseTemplate.sol -o packages/core-sdk/src/abi/json/tmp/PILicenseTemplate
	solc @erc6551/=node_modules/erc6551/ --pretty-json --base-path packages/core-sdk/protocol-core-contracts --include-path packages/core-sdk/protocol-core-contracts/node_modules/ --abi packages/core-sdk/protocol-core-contracts/contracts/lib/Errors.sol -o packages/core-sdk/src/abi/json/tmp/Errors
	cp packages/core-sdk/src/abi/json/tmp/Errors/Errors.abi packages/core-sdk/src/abi/json/Errors.json

	cd packages/core-sdk/protocol-periphery-contracts && yarn install 

	solc @storyprotocol/core/=node_modules/@story-protocol/protocol-core/contracts/ --pretty-json --base-path packages/core-sdk/protocol-periphery-contracts --include-path packages/core-sdk/protocol-periphery-contracts/node_modules/ --abi packages/core-sdk/protocol-periphery-contracts/contracts/StoryProtocolGateway.sol -o packages/core-sdk/src/abi/json/tmp/StoryProtocolGateway
	solc @storyprotocol/core/=node_modules/@story-protocol/protocol-core/contracts/ --pretty-json --base-path packages/core-sdk/protocol-periphery-contracts --include-path packages/core-sdk/protocol-periphery-contracts/node_modules/ --abi packages/core-sdk/protocol-periphery-contracts/contracts/SPGNFT.sol -o packages/core-sdk/src/abi/json/tmp/SPGNFT

	rm -rf packages/core-sdk/src/abi/json/tmp
	rm -rf packages/core-sdk/protocol-core-contracts
	rm -rf packages/core-sdk/protocol-periphery-contracts
