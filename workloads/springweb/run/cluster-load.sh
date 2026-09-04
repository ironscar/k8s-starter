# needs to run in WSL env from repository root instead of app root
cd ../..
rm repository/springweb/k8s-dck-springweb-v0.0.1.tar
docker save -o repository/springweb/k8s-dck-springweb-v0.0.1.tar k8s-dck-springweb:0.0.1
cat repository/springweb/k8s-dck-springweb-v0.0.1.tar | nerdctl -n k8s.io load
kubectl delete deployment springweb
kubectl apply -f deployments/springweb/deployment.yaml
cd workloads/springweb