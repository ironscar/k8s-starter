# build stage
FROM maven:3.9.16-eclipse-temurin-21-alpine AS build

# create app directory and go into it
WORKDIR /app

# copy settings.xml, pom and cache dependencies until pom changes
COPY pom.xml ./
# bindings were to copy a custom settings.xml to work with corporate registries behind firewall
# COPY bindings/maven/settings.xml ./
# RUN mvn -s ./settings.xml dependency:go-offline

# copy source code
COPY src ./src

# build the app and skip tests to speed up build
RUN mvn clean package -DskipTests

# ------------------------------------------------------------------------------------- #

# run stage
FROM cleanstart/jre:26.0.2.1_p1-amd64

# create app directory and go into it
WORKDIR /app

# copy built WAR
COPY --from=build /app/target/*.jar springweb.jar

# export port and run app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "springweb.jar"]
