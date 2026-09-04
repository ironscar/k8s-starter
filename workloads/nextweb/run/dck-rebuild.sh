# needs to run in WSL env
docker stop kdnw && docker rm kdnw
docker rmi k8s-dck-nextweb:0.0.1
docker build -t k8s-dck-nextweb:0.0.1 .
