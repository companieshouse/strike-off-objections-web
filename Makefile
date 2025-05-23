artifact_name       := strike-off-objections-web
version             := "unversioned"

.PHONY: all
all: build

.PHONY: githooks
githooks:
	git config core.hooksPath .githooks

.PHONY: clean
clean:
	rm -f ./$(artifact_name)-*.zip
	rm -rf ./build-*
	rm -rf ./dist
	rm -f ./build.log

.PHONY: build
build: update_submodules
	npm i
	npm run build

.PHONY: lint
lint:
	npm run lint

.PHONY: sonar
sonar: test
	npm run sonarqube

.PHONY: test
test:
	npm run coverage

.PHONY: test-unit
test-unit:
	npm run test

.PHONY: package
package: build
ifndef version
	$(error No version given. Aborting)
endif
	$(info Packaging version: $(version))
	$(eval tmpdir := $(shell mktemp -d build-XXXXXXXXXX))
	cp -r ./dist/* $(tmpdir)
	mkdir $(tmpdir)/api-enumerations
	cp ./api-enumerations/*.yml $(tmpdir)/api-enumerations
	cp -r ./package.json $(tmpdir)
	cp -r ./package-lock.json $(tmpdir)
	cd $(tmpdir) && npm i --production
	rm $(tmpdir)/package.json $(tmpdir)/package-lock.json
	cd $(tmpdir) && zip -r ../$(artifact_name)-$(version).zip .
	rm -rf $(tmpdir)

.PHONY: security-check
security-check:
	npm audit

.PHONY: dist
dist: lint test-unit clean package

.PHONY: update_submodules
update_submodules:
	test -f ./api-enumerations/constants.yml || git submodule update --init --recursive -- api-enumerations
