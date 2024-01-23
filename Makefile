compile_contracts:
	git submodule add -b main --force https://github.com/storyprotocol/protocol-core packages/core-sdk/protocol-contracts
	git submodule update --remote --merge
	cd packages/core-sdk/protocol-contracts && npm i && forge install

	solc --pretty-json --base-path packages/core-sdk/protocol-contracts --include-path packages/core-sdk/protocol-contracts/node_modules/ --abi packages/core-sdk/protocol-contracts/contracts/AccessController.sol -o packages/core-sdk/src/abi/json/tmp/AccessController
	solc --pretty-json --base-path packages/core-sdk/protocol-contracts --include-path packages/core-sdk/protocol-contracts/node_modules/ --abi packages/core-sdk/protocol-contracts/contracts/modules/RegistrationModule.sol -o packages/core-sdk/src/abi/json/tmp/RegistrationModule
	solc --pretty-json --base-path packages/core-sdk/protocol-contracts --include-path packages/core-sdk/protocol-contracts/node_modules/ --abi packages/core-sdk/protocol-contracts/contracts/modules/tagging/TaggingModule.sol -o packages/core-sdk/src/abi/json/tmp/TaggingModule
	solc --pretty-json --base-path packages/core-sdk/protocol-contracts --include-path packages/core-sdk/protocol-contracts/node_modules/ --abi packages/core-sdk/protocol-contracts/contracts/interfaces/registries/IIPAccountRegistry.sol -o packages/core-sdk/src/abi/json/tmp/IIPAccountRegistry
	solc --pretty-json --base-path packages/core-sdk/protocol-contracts --include-path packages/core-sdk/protocol-contracts/node_modules/ --abi packages/core-sdk/protocol-contracts/contracts/registries/LicenseRegistry.sol -o packages/core-sdk/src/abi/json/tmp/LicenseRegistry
	solc --pretty-json --base-path packages/core-sdk/protocol-contracts --include-path packages/core-sdk/protocol-contracts/node_modules/ --abi packages/core-sdk/protocol-contracts/contracts/registries/ModuleRegistry.sol -o packages/core-sdk/src/abi/json/tmp/ModuleRegistry

	echo 'export default '"$$(jq --argjson entities "$$(jq -c '.' packages/core-sdk/src/abi/sdkEntities.json)" 'map(select(.name as $$name | $$entities | if type == "array" then index($$name) else false end))' packages/core-sdk/src/abi/json/tmp/AccessController/AccessController.abi)"' as const;' > packages/core-sdk/src/abi/json/AccessController.abi.ts
	echo 'export default '"$$(jq --argjson entities "$$(jq -c '.' packages/core-sdk/src/abi/sdkEntities.json)" 'map(select(.name as $$name | $$entities | if type == "array" then index($$name) else false end))' packages/core-sdk/src/abi/json/tmp/RegistrationModule/RegistrationModule.abi)"' as const;' > packages/core-sdk/src/abi/json/RegistrationModule.abi.ts
	echo 'export default '"$$(jq --argjson entities "$$(jq -c '.' packages/core-sdk/src/abi/sdkEntities.json)" 'map(select(.name as $$name | $$entities | if type == "array" then index($$name) else false end))' packages/core-sdk/src/abi/json/tmp/TaggingModule/TaggingModule.abi)"' as const;' > packages/core-sdk/src/abi/json/TaggingModule.abi.ts
	echo 'export default '"$$(jq --argjson entities "$$(jq -c '.' packages/core-sdk/src/abi/sdkEntities.json)" 'map(select(.name as $$name | $$entities | if type == "array" then index($$name) else false end))' packages/core-sdk/src/abi/json/tmp/IIPAccountRegistry/IIPAccountRegistry.abi)"' as const;' > packages/core-sdk/src/abi/json/IIPAccountRegistry.abi.ts
	echo 'export default '"$$(jq --argjson entities "$$(jq -c '.' packages/core-sdk/src/abi/sdkEntities.json)" 'map(select(.name as $$name | $$entities | if type == "array" then index($$name) else false end))' packages/core-sdk/src/abi/json/tmp/LicenseRegistry/LicenseRegistry.abi)"' as const;' > packages/core-sdk/src/abi/json/LicenseRegistry.abi.ts
	echo 'export default '"$$(jq --argjson entities "$$(jq -c '.' packages/core-sdk/src/abi/sdkEntities.json)" 'map(select(.name as $$name | $$entities | if type == "array" then index($$name) else false end))' packages/core-sdk/src/abi/json/tmp/ModuleRegistry/ModuleRegistry.abi)"' as const;' > packages/core-sdk/src/abi/json/ModuleRegistry.abi.ts

	rm -rf packages/core-sdk/src/abi/json/tmp
	rm -rf packages/core-sdk/protocol-contracts
