FROM armory-docker-local.jfrog.io/armory-cloud/go-app
MAINTAINER engineering@armory.io
COPY ./build/dist/linux_amd64/potatofacts /opt/go-application/goapp
COPY ./ui/dist/staging /opt/go-application/ui/staging
COPY ./ui/dist/prod /opt/go-application/ui/prod

