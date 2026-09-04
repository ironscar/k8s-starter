# Getting Started

## Traditional Build and Run

- Currently running with JDK25 so have to make sure JDK in POM is 25
- CD into `./workloads/springweb`
- Basic build `mvn clean package -DskipTests`
- Basic run `java -jar ./target/springweb-0.0.1-SNAPSHOT.jar`
- Find the demo endpoint at `http://localhost:8080/k8s-springweb/api/demo`

## Database connection

- Works directly wnen DB is run in localhost with connection URL as `jdbc:postgresql://localhost:5432/postgres`

---

## Kubernetes Build and Run

### Dockerfile

- Could only find Maven for JDK21 in artifactory so have to update JDK in POM to 21 but we will run it with JRE25
- Use the dockerfile to create image using `docker build -t k8s-dck-springweb:0.0.1 ./workloads/springweb`
  - this took `24m 47s` for build stage and `2.8s` for run stage the first time
- Run the image as `docker run -d -p 8080:8080 --name kdsw k8s-dck-springweb:0.0.1` 
  - we can rerun the container using `docker start kdsw`
- Find the demo endpoint at `http://localhost:8080/k8s-springweb/api/demo`
- This used to work inside VPN but currently made to work outside due to some other issues [CAVEAT]

#### Database connection for docker containers

- When app is dockerized, both need to be on same docker network
  - create a network with `docker network create kdnet`
- Then run both db and app on same network using `--network kdnet` in the `run` command
  - or we can connect existing db container to this network using `docker network connect kdnet pgdb1`
- Then the connection URL becomes `jdbc:postgresql://pgdb1:5432/postgres`

#### Database connection for Kubernetes cluster

- If Postgres is running externally to the cluster, then we need to create an external service
  - this is as shown in `deployments/pgdb/service.yaml`
  - the connection URL becomes `jdbc:postgresql://pgdb1-external-service:5432/postgres`
    - we cannot use `localhost` or `127.0.0.1` as this points to the same pod as the app
    - instead, we have to use rancher desktop external name as shown as it manages the internal loopback
  - we also have to update the the db container to allow listening from cluster
    - the port mapping for pgdb1 on `docker ps` must say `0.0.0.0:5432->5432` which is default
    - now we have to update `listen_addresses` in `postgresql.conf` to `*` which is also default
  - if it was an actual deployed postgres instance, we could connect to it by specifying the host domain name in the `externalName`

### Paketo

- Refer to `docs/paketo.md`

---
