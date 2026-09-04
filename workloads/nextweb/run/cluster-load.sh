# needs to run in WSL env from repository root instead of app root
cd ../..
rm repository/nextweb/k8s-dck-nextweb-v0.0.1.tar
docker save -o repository/nextweb/k8s-dck-nextweb-v0.0.1.tar k8s-dck-nextweb:0.0.1
cat repository/nextweb/k8s-dck-nextweb-v0.0.1.tar | nerdctl -n k8s.io load
kubectl delete deployment nextweb
kubectl apply -f deployments/nextweb/deployment.yaml
cd workloads/nextweb