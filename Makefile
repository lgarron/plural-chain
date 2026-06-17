.PHONY: build
build: setup
	bun run -- ./script/build.ts

.PHONY: check
check: lint test build check-package.json

.PHONY: setup
setup:
	bun install --frozen-lockfile

.PHONY: lint
lint: lint-biome lint-readme-cli-help lint-typescript-main lint-typescript-examples

.PHONY: lint-biome
lint-biome: setup
	bun x -- bun-dx --package @biomejs/biome biome -- check

.PHONY: lint-readme-cli-help
lint-readme-cli-help: setup
	bun x -- bun-dx --package readme-cli-help readme-cli-help -- check

.PHONY: lint-typescript-main
lint-typescript-main: setup
	bun x -- bun-dx --package @typescript/native-preview tsgo -- --project ./

.PHONY: lint-typescript-examples
lint-typescript-examples: setup
	bun x -- bun-dx --package @typescript/native-preview tsgo -- --project ./examples

.PHONY: format
format: setup
	bun x -- bun-dx --package @biomejs/biome biome -- check --write
	bun x -- bun-dx --package readme-cli-help readme-cli-help -- update

.PHONY: check
check: lint test build check-package.json

.PHONY: test
test: setup
	bun test
	# Check that the example code runs successfully.
	bun run -- './examples/readme-example.ts'

.PHONY: check-package.json
check-package.json: build
	bun x -- bun-dx --package @cubing/dev-config package.json -- check

RM_RF = bun -e 'process.argv.slice(1).map(p => process.getBuiltinModule("node:fs").rmSync(p, {recursive: true, force: true, maxRetries: 5}))' --

.PHONY: clean
clean:
	${RM_RF} ./dist/

.PHONY: reset
reset: clean
	${RM_RF} ./node_modules/

.PHONY: prepublishOnly
prepublishOnly: lint test clean build

.PHONY: publish	
publish:
	npm publish
