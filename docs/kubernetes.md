# Kubernetes

## Introduction

-Kubernetes provides following features:
    - `Service discovery and load balancing`: K8s can expose a container using DNS or IP and balance traffic to instances of that container
    - `Storage orchestration`: K8s allows mounting a storage system of choice
    - `Automated rollouts and rollbacks`: K8s can change current state of containers to a described target state at a controlled rate
    - `Automatic bin packing`: K8s can fit the containers with specified CPU/RAM requirements on to nodes to make best use of resources
    - `Self-healing`: K8s can restart containers that fail or dont response to health checks
    - `Secret and configuration`: K8s allows storing sensitive information and application configuration in a way that they can be updated without rebuilding container images
- K8s runs workloads in containers which are run on pods which exist on nodes which may or may not be a VM
  - each node is managed by the control plane and contains services necessary to run the pods
  - The machine stack looks like: [HARDWARE] -> [HYPERVISOR] -> [VM]*N -> [OS] -> [CONTAINER-RUNTIME] -> [CONTAINER]*N -> [APP]

## Control Plane Components

The control plane components make global decisions about the cluster and responding to cluster events
- `kube-apiserver`: The API server that exposes the Kubernetes API for the control plane
- `etcd`: Consistent and highly-available key value store used for storing cluster data
- `kube-scheduler`: Watches for newly created pods with no assigned nodes and selects a node for them to run on based on resource requirements etc
- `kube-controller-manager`: Runs controller processes
  - `node-controller`: Responsible for detecting and responding when nodes go down
  - `job-controller`: Watches for Job objects that represent one-off tasks and creates pods to run those tasks
  - `endpoint-slice-controller`: populates EndpointSlice objects to provide link between services and pods
  - `service-account-controller`: create default service accounts for new namespaces
  - there are others as well and while these are all logically separate, they are compiled and run as a single process
- The `kube-apiserver` talks to the `kube-controller-manager`, `etcd` and `kube-scheduler`
- The control nodes are usually deployed in sets of 3 to provide failure resilience

## Node Components

Node components run on every node, maintaining running pods and providing the runtime environment
- `kubelet`: An agent (non-ML agent) running on every node (worker and control) in cluster and makes sure that containers are running in pods
  - it ensures that containers described in the provided `PodSpecs` are running and healthy
- `kube-proxy`: This is a network proxy that runs on every node (worker and control) in cluster and maintains network rules on the nodes
  - uses the OS packet filtering layer if one is available, else forwards the traffic itself
- `container-runtime`: Responsible for managing execution and lifecycle of containers within the K8s environment
  - any runtime that supports the Kubernetes Container Runtime Interface (CRI) is supported such as `containerd`
- The `kubelet` and `kube-proxy` talks to the `kube-apiserver` in the control plane directly
- There could be multiple node pools to support different types of workloads: high-memory / high-GPU / high-CPU

## Addons

- Addons use K8s resources to implement cluster features
- Namespaced resources for addons belong within the `kube-system` namespace
- Some important addons are detailed below:
  - `DNS`: This is the DNS server which servers DNS records for the Kubernetes services
    - containers started by K8s automatically include this DNS server in their DNS registry
    - this is a mandatory addon
  - `Web UI`: This is a web-based dashboard for the cluster allowing users to manage and troubleshoot the cluster or applications running in the cluster
  - `Container resource monitoring`: Records generic time-series metrics about containers in a central database and provides a UI for browsing that data
  - `Cluster-level logging`: Responsible for saving container logs to a central log store with search/browsing interface
  - `Network plugins`: Software components that implement the Container Network Interface (CNI) specification responsible for allocating IP addresses to pods and enabling them to communicate in the cluster

## Deployments

- A deployment instructs kubernetes how to create and update instances of an application
- The control plane then schedules the application instances on worker nodes in the cluster
- The kubernetes deployment controller continuously monitors the instances and provides self-healing too

---

## Deploying an app container to run on k3

- We can either use Rancher UI or CLI (we will prefer this as its closer to production usage)
- First we will do it without Helm and then with Helm to appreciate the differences
- We create the `deployments/springweb/deployment.yaml`
- Next we will attempt to tar our image and use containerd to load it into Rancher k3
  - this is required because our image is not hosted on a repository and needs to be manually imported into Rancher k3
  - tar it using `docker save -o repository/springweb/k8s-dck-springweb-v0.0.1.tar k8s-dck-springweb:0.0.1`
  - load it into rancher using containerd like `cat k8s-dck-springweb-v0.0.1.tar | nerdctl -n k8s.io load`
    - this streams the tar file content from the WSL distribution to the rancher distribution
  - run `kubectl run springweb --image=k8s-dck-springweb:0.0.1 --image-pull-policy=Never` to deploy
    - use `image-pull-policy=Never` for local development to avoid trying to pull from repository
    - this starts a pod with the container running but its isolated
    - we can also run the `deployment.yaml` at this point to do the same thing
    - so we create a temporary port-forwarder for now but ideally we should use `ingress` or `nodeport` service
      - `kubectl port-forward springweb 8080:8080` (latter is the container port)
      - the app is now gets successful responses from `http://localhost:8080/k8s-springweb/api/demo`
      - after exiting the port-forwarded, it becomes unreachable again
  - the app stays active even after restarting rancher desktop
- To run local docker images in k3d cluster
  - we can import them by `k3d image import <imagename:tag> --cluster <clustername>`
  - then we do `kubectl apply -f deployments/springweb/deployment.yaml` to create the pod
    - this creates a selector like `app: springweb` whereas `kubectl run` creates `run: springweb`
    - this is required in the `service.yaml`
  - then we can do port forwarding as above to get successful responses from the application
- If we have a new image with same version for local development
  - we can import it into k3d and just delete the current pod using `kubectl delete pod <podname>`
  - this will delete the old pod and create a new pod with the new image

### Connecting to Application

- First, we create a `Service` for a `Deployment` so that the application is accessible inside the cluster
  - Follow `deployments/springweb/service.yaml`, then run `kubectl apply -f deployments/springweb/service.yaml`
  - Then `kubectl get svc` will show the new service created for the app with its cluster IP
- Second, we need to install an `Ingress Controller`, k3s ships with `Traefik` out of the box
  - we create a cluster with a port mapping for the load balancer as `k3d cluster create <clustername> -p "<hostport>:<serviceport>@loadbalancer" --agents 1` since this cannot be done later easily
  - then we create a `deployments/ingress.yaml` and apply that using `kubectl`
- Now we no longer need a temporary port-forwarder or an explicit node-port and can access the app at same URL
- Similarly, we can deploy multiple apps at different base URLs as shown in `deployments/ingress.yaml`

- Since `k3d` is no longer working, have to use `Rancher` end-to-end
- The steps for creating deployment, service and ingress remain the same
- But Rancher exposes Traefik ingress on port 80 instead of 8080
  - let's edit the traefik service port by `kubectl edit svc <traefik-service-name> -n <traefik-namespace>`
    - the traefik service is called `traefik` and is defined in the `kube-system` namespace
    - this opens a `vi` like editor for the service where we can edit `spec.ports.port` for `web` and do `:wq` to save changes
    - after this app will be accessible at `http://localhost:8080/k8s-nextweb`

- It usually a best practice to specify a name for each port in the `deployment.yaml`
  - this is because when specified, Kubernetes registers the name and we can use the name in the service and ingress yaml
    - we did find Traefik not working with `podinfo` Helm chart unless we used the name in ingress, but couldn't reproduce with the other apps, so couldn't find an exact reason either
  - this allows the ingress yaml to remain unchanged if the service yaml has to change the port number for some reason
  - this also allows the service yaml to remain unchanged if the container has to change the running port number for some reason

## Setup configMap

- `configMaps` are used to set non-confidential configuration data in key-value pairs
  - refer to `deployments/springweb/configmap.yaml`
- we can check the current configmaps by running `kubectl get configmaps`
- we can apply our configmap manifest by running `kubectl apply -f deployments/springweb/configmap.yaml`
  - we can see the data using `kubectl describe configmap <configmap-name>`
- these are usually loaded up as environment variables in the `deployment.yaml` using `envFrom` and `configMapRef`
  - refer to `deployments/springweb/deployment.yaml`
  - `envFrom` typically injects all the keys from the configMap as is into the container
  - after applying the deployment, we can verify that our pod now has this env var by running `kubectl exec <podname> -- env`
- If we modify a configMap, the env variables injected into the pod and its containers aren't auto-updated and must be restarted to pull the new values
  - this is done by `kubectl rollout restart deployment/<deployment-name>` (deployment here is not a directory path) to restart all pods covered by that deployment
  - this doesn't arbitraly remove pods but creates new pods and makes sure that they pass the readiness check before removing old pods, thus creating zero downtime
