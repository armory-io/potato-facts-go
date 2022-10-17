APP_NAME=potatofacts
VERSION ?= $(shell ./scripts/version.sh)
REGISTRY ?= "index.docker.io"
REGISTRY_ORG ?= "armory"
GOARCH ?= $(shell go env GOARCH)
GOOS ?= $(shell go env GOOS)
PWD = $(shell pwd)
IMAGE_TAG ?= $(VERSION)
LOCAL_KUBECTL_CONTEXT ?= "armory-cloud-dev"
IMAGE := $(subst $\",,$(REGISTRY)/$(REGISTRY_ORG)/${APP_NAME}:${VERSION})

BUILD_DIR := ${PWD}/build
DIST_DIR := ${BUILD_DIR}/bin/$(GOOS)_$(GOARCH)

.PHONY: all
all: build

############
## Building
############
.PHONY: version
version:
	@echo $(VERSION)

.PHONY: lint
lint:
	@find pkg cmd -name '*.go' | grep -v 'generated' | xargs -L 1 golint

.PHONY: clean
clean:
	rm -fr $(BUILD_DIR)

.PHONY: build-dirs
build-dirs:
	@mkdir -p $(BUILD_DIR) $(DIST_DIR) "$(BUILD_DIR)/reports"

.PHONY: build
build: build-dirs Makefile
	@echo "Building ${DIST_DIR}/${APP_NAME}..."
	@go build -ldflags "-X main.version=${VERSION}" -o ${DIST_DIR}/${APP_NAME} cmd/${APP_NAME}/main.go

.PHONY: api-docs
api-docs:
	@echo "Building Open API 2.0 docs..."
	mkdir -p build/api-docs
	docker run --rm -v ${HOME}:${HOME} -w ${PWD} \
		quay.io/goswagger/swagger \
		generate spec \
			--output build/api-docs/api.json \
			--scan-models \
			--include github.com/armory-io/${APP_NAME}

.PHONY: build-linux
build-linux: export GOOS=linux
build-linux: export GOARCH=amd64
build-linux: export GO111MODULE=on
build-linux: export CGO_ENABLED=0
build-linux: export DIST_DIR=${BUILD_DIR}/dist/$(GOOS)_$(GOARCH)
build-linux: build-dirs Makefile
	@echo "Building ${DIST_DIR}/${APP_NAME}..."
	@go build -ldflags "-X main.version=${VERSION}" -o ${DIST_DIR}/${APP_NAME} cmd/${APP_NAME}/main.go

############
## Testing
############
.PHONY: check
check: export APP_NAME:=$(APP_NAME)
check: export BUILD_DIR:=$(BUILD_DIR)
check:
	@echo "Nothing to do, skipping..."

#####################
## Image Baking
#####################
.PHONY: docker
docker: build-linux
	@docker build \
	-t $(REGISTRY)/$(REGISTRY_ORG)/${APP_NAME}:$(VERSION) \
	-t $(REGISTRY)/$(REGISTRY_ORG)/${APP_NAME}:latest \
	-f Dockerfile .

.PHONY: push
push:
	@docker push $(REGISTRY)/$(REGISTRY_ORG)/${APP_NAME}:$(VERSION)
	@docker push $(REGISTRY)/$(REGISTRY_ORG)/${APP_NAME}:latest

#############
## Utilities
#############
.PHONY: format
format:
	@go fmt ./...

#####################
## Manifest Baking
#####################
define render_template
	mkdir -p ${BUILD_DIR}/manifests
	docker run -v ${PWD}/infrastructure/helm:/helm-values alpine/helm:3.7.2 \
		template \
		--namespace "armory-hosted-services-${1}" \
		-f "/helm-values/values.yaml" \
		-f "/helm-values/values-${1}.yaml" \
		--set imageTag="${2}" \
		--repo https://armory.jfrog.io/artifactory/charts \
		infra-go-service-helm-chart > "build/manifests/${1}-manifests.yaml"
endef

.PHONY: render-manifests
render-manifests: render-staging-helm-chart render-prod-helm-chart

.PHONY: render-prod-helm-chart
render-prod-helm-chart: build-dirs
	$(call render_template,"prod",${IMAGE_TAG})

.PHONY: render-staging-helm-chart
render-staging-helm-chart: build-dirs
	$(call render_template,"staging",${IMAGE_TAG})

#####################
## Deploy
#####################
.PHONY: deploy-local
deploy-local: minikube-load
	kubectl --context=$(LOCAL_KUBECTL_CONTEXT) patch deployment ${APP_NAME} --patch '{"spec": {"template": {"spec": {"containers": [{"name": $(APP_NAME), "image": "$(IMAGE)"}]}}}}'

.PHONY: deploy-staging
deploy-staging: clean build-dirs docker push render-staging-helm-chart
	armory login
	armory deploy start --file infrastructure/armory/deploy-staging.yaml

#####################
## Local Development
#####################
.PHONY: debug
debug: SHELL:=/usr/bin/env bash
debug: export ADDITIONAL_ACTIVE_PROFILES="local-overrides"
debug: export APPLICATION_NAME=${APP_NAME}
debug: export APPLICATION_VERSION=${VERSION}
debug: build-dirs
	@echo "Building ${DIST_DIR}/${APP_NAME}..."
	@go build -ldflags "-X main.version=${VERSION}" -o ${DIST_DIR}/${APP_NAME}-debug -gcflags "all=-N -l" cmd/${APP_NAME}/main.go
	if [[ -f "${HOME}/.armory/${APP_NAME}.env" ]] ; then echo "sourcing ~/.armory/${APP_NAME}.env"; source "${HOME}/.armory/${APP_NAME}.env" ; fi
	dlv --listen=:2345 --headless=true --api-version=2 --accept-multiclient exec ${DIST_DIR}/${APP_NAME}-debug

.PHONY: run
run: SHELL:=/usr/bin/env bash
run: export ADDITIONAL_ACTIVE_PROFILES="local-overrides"
run: export APPLICATION_NAME=${APP_NAME}
run: export APPLICATION_VERSION=${VERSION}
run: build-dirs
	@echo "Building ${DIST_DIR}/${APP_NAME}..."
	@go build -ldflags "-X main.version=${VERSION}" -o ${DIST_DIR}/${APP_NAME} cmd/${APP_NAME}/main.go
	if [[ -f "${HOME}/.armory/${APP_NAME}.env" ]] ; then echo "sourcing ~/.armory/${APP_NAME}.env"; source "${HOME}/.armory/${APP_NAME}.env" ; fi
	${DIST_DIR}/${APP_NAME}