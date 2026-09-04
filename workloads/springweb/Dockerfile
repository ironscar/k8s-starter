# build stage
FROM artifactory.itg.ti.com/docker-public-local/maven:3.9.11-eclipse-temurin-21 AS build

# create app directory and go into it
WORKDIR /app

# copy settings.xml, pom and cache dependencies until pom changes
COPY pom.xml ./
# bindings were to copy a custom settings.xml to work with corporate registries behind firewall
# COPY bindings/maven/settings.xml ./
# RUN mvn -s ./settings.xml dependency:go-offline

# copy source code
COPY src ./src
# run using custom settings.xml (temp disabled due to other issues)
# RUN mvn -s ./settings.xml clean package -DskipTests
RUN mvn clean package -DskipTests

# ------------------------------------------------------------------------------------- #

# run stage
FROM artifactory.itg.ti.com/docker-public-local/eclipse-temurin:25_36-jre-alpine

# create app directory and go into it
WORKDIR /app

# copy built WAR
COPY --from=build /app/target/*.jar springweb.jar

# export port and run app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "springweb.jar"]
