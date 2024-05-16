SHELL = '/bin/bash'

default: help

help: ## The help text you're reading.
	@grep --no-filename -E '^[0-9a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

deploy: ## Deploy all to Firebase
	firebase deploy

dev-up: # Start a local firebase emulator
	firebase emulators:start

dev-up-debug: # Start a local firebase emulator with a debugger
	firebase emulators:start --inspect-functions

shares: # Set the number of VUSA shares
	firebase functions:secrets:set VUSA_SHARES
