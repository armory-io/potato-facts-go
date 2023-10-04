FROM armory-docker-local.jfrog.io/armory-cloud/go-app
MAINTAINER engineering@armory.io
COPY ./build/dist/linux_amd64/potatofacts /opt/go-application/goapp
COPY ./ui/dist/prod /opt/go-application/ui/dist/prod
#explicitly define default workdirectory, so in case the image is used without any value for APPLICATION_ENVIRONMENT it will still be able to find default location of UI content
WORKDIR /opt/go-application
