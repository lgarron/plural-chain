.PHONY: build
build: setup
	bun run ./script/build.ts

.PHONY: setup
setup:
	bun install --no-save

.PHONY: lint
lint: setup
	bun x @biomejs/biome check
	bun x readme-cli-help check

.PHONY: format
format: setup
	bun x @biomejs/biome check --write
	bun x readme-cli-help update

.PHONY: check
check: lint test build

.PHONY: test
test: setup
	bun test
	# Check that the example code runs successfully.
	bun run -- './examples/readme-example.ts'

.PHONY: clean
clean:
	rm -rf ./dist

.PHONY: reset
reset: clean
	rm -rf ./node_modules

.PHONY: prepublishOnly
prepublishOnly: lint test clean build

.PHONY: publish	
publish:
	npm publish
