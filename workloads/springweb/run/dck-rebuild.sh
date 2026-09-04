# needs to run in WSL env
docker stop kdsw && docker rm kdsw
docker rmi k8s-dck-springweb:0.0.1
docker build -t k8s-dck-springweb:0.0.1 .
