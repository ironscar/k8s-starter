# My Kubernetes Starter

## References

This section includes the glossary of files in this repository:

- `docs/k8s-roadmap.md`: Roadmap for ramping up on K8s
- `docs/kubernetes.md`: Details on K8s
- `docs/vks.md`: Details on vSphere Kubernetes Service
- `docs/paketo.md`: Details about Paketo buildpacks
- `docs/helm.md`: Details on Helm charts
- `docs/observability.md`: Details on how to setup Observability stack

Other directories of importance apart from `docs` are:

- `workloads`: all the apps that we want to containerize
- `repository`: all the image TARs that are needed to be manually pulled into Rancher for local development
- `deployments`: all the deployment yaml files corresponding to each app for vanilla (without Helm) k8s deployment
- `helm-deployments`: all the helm charts for k8s deployments

---

## Run local clusters with Rancher / K3

- Download `Rancher Desktop` from https://github.com/rancher-sandbox/rancher-desktop/releases (needs WSL2 to run)
  - currently installed only for `local user` and enabled container runtime as `containerd` which is standard
    - went outside TI network and ran `kubectl` which downloaded kubectl
    - then enabled K8s from `Preferences > Kubernetes` which restarted things and started downloading K8s components
  - after everything is done, we can load the Cluster Dashboard from the UI to see things or run `kubectl get nodes` inside `TI-CentOS` WSL to see the node details
- Rancher uses `K3` by default which is a lightweight distribution of Kubernetes and starts with one node that doubles as both a control and worker node
- To run multiple nodes locally, we need to use `k3d`
  - run `curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash` on WSL2 to install
    - this downloads from github so has to be done outside TI network
  - then we can run `k3d cluster create <cluster-name> --agents 1` (cluster name currently is `mn-cluster`)
    - this internally downloads some docker images from `docker.io` so has to be done outside of TI network
    - this creates a cluster with 1 control-plane node and 1 worker-node
  - this also downloads a new `kubectl` and points it to the k3d context
    - but by default if we didn't have kubectl, it doesn't download so we have to manually download it and install it into WSL2
      - to download `curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"`
      - to install `sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl`
      - now we can remove the kubectl download from current path
    - now, we can check this by running `kubectl config get-contexts`
    - we can switch it to rancher k3 by `kubectl config use-context rancher-desktop` and back when needed

- Currently K3 not working so continuing with Rancher
  - Currently Rancher also only seems to be able to connect to WSL and start the cluster when inside VPN
    - but after initial connection, it works fine inside VPN as well
    - it also works outside of VPN or directly in company Wifi
  - Current cluster apps depend on the `pgdb1` Postgres container to work so need to start that after starting Rancher desktop
- We did setup k3d and helm on personal laptop Ubuntu WSL and its installation steps can be found on `Laptop setups` in Notion (this works)

- Steps to run the most recent version of the cluster deployments:
  - `docker start pgdb1` to start the external Postgres container (if not already started - check via `docker ps`)
  - `helm install k8s-stack helm-deployments/k8s-stack/k8s-appstack-chart-0.1.0.tgz` to start the NextJS front-end, SpringBoot back-end and Postgres external service (if not already installed - check via `helm ls`)
  - `helm install my-podinfo stefanprodan/podinfo` to start the pre-packaged public podinfo service (if not already installed - check via `helm ls`)

- Now to test whether you can use the CLI or not
  - `kubectl get nodes` will return all the nodes in the cluster
    - there are 3 control plane nodes and 4 worker nodes
  - `kubectl get pods` will return all the pods in the cluster
  - `watch kubectl top pod <podname>` to get a 2-second streaming update for CPU and memory stats of a pod

---
