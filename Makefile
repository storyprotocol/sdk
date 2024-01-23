compile_contracts:
	git submodule add -b main --force https://github.com/storyprotocol/protocol-core packages/core-sdk/protocol-contracts
	git submodule update --remote --merge
	cd packages/core-sdk/protocol-contracts && npm i

	solc --pretty-json --base-path packages/core-sdk/protocol-contracts --include-path packages/core-sdk/protocol-contracts/node_modules/ --abi packages/core-sdk/protocol-contracts/contracts/modules/RegistrationModule.sol -o packages/core-sdk/src/abi/json/tmp/StoryProtocol
	
	echo 'export default '"$$(jq --argjson entities "$$(jq -c '.' packages/core-sdk/src/abi/sdkEntities.json)" 'map(select(.name as $$name | $$entities | if type == "array" then index($$name) else false end))' packages/core-sdk/src/abi/json/tmp/StoryProtocol/StoryProtocol.abi)"' as const;' > packages/core-sdk/src/abi/json/StoryProtocol.abi.ts

	rm -rf packages/core-sdk/src/abi/json/tmp
	rm -rf packages/core-sdk/protocol-contracts
