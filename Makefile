TOP_DIR=.
README=$(TOP_DIR)/README.md

VERSION=$(strip $(shell cat version))

build: init
	@echo "Building the software..."
	@yarn bundle

init: install dep setenv
	@echo "Initializing the repo..."

github-action-init: install dep setenv
	@echo "Initializing the repo..."

install:
	@echo "Install software required for this repo..."
	@sudo npm install -g @abtnode/cli

github-action-install:
	@echo "Install software required for this repo..."
	@sudo npm install -g @abtnode/cli

dep:
	@echo "Install dependencies required for this repo..."
	@yarn

pre-build: install dep
	@echo "Running scripts before the build..."

post-build:
	@echo "Running scripts after the build is done..."

all: pre-build build post-build

test:
	@echo "Running test suites..."

doc:
	@echo "Building the documenation..."

setenv:
	@echo "Setup .env file..."
	@echo "SKIP_PREFLIGHT_CHECK=true" > .env

precommit: setenv dep

github-action-test:
	@make precommit

clean:
	@echo "Cleaning the build..."

run:
	@echo "Running the software..."
	@yarn start

include .makefiles/*.mk

.PHONY: build init install dep pre-build post-build all test doc precommit github-action-test clean watch run bump-version create-pr
