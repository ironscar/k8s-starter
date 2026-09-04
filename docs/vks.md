# vSphere Kubernetes Service

## Introduction

- A VKS cluster is an opinionated installation of K8s tightly integrated with underlying vSphere infrastructure and is part of the `VKS Grid`instance which includes following components:
  - `Supervisor/Management cluster`: a K8s cluster that preforms the role fo the primary management and operational center for the `VKS Grid` instance
    - it communicates with `vCenter` to provision new VMs and persistent volumes
    - it also faciliates user authentication
    - there is only one per vCenter
  - `Provisioner/vSphere namespace`: A namespace in the supervisor cluster that contains one or more workload clusters
    - this is a vSphere namespace and not the same as a K8s namespace
  - `Workload cluster`: a VKS cluster that runs application workloads typically containing 3 control nodes and 2 worker ndoes (number of pods may determine number of nodes)
  - `Tanzu mission control`: SaaS offering from VMWare that provides a GUI to administer VKS workload clusters
- The K8s user kubectl has access to the supervisor cluster as well as the workload clusters
- Addons are pre-provisioned to jump-start cluster management
  - `Prometheus` (time series DB for storing metrics)
  - `Grafana` (observability dashboard)
  - `Fluent-bit` (log collector/processor/forwarder)
  - `Velero` (backup)

### Terms

- `vSphere`: The VMWare platform
- `ESXi`: The hypervisor installed on physical servers that run the VMs
- `vCenter`: The management software that controls the ESXi hosts in the data center
- `AVI Controller`: This acts as the centralized brain that manages load balancing and traffic for the cluster
- `AVI Service Engine`: AVI SE are software-defined load balancers that can be scaled out to handle the traffic management for the cluster

## Architecture

- The machine stack looks like: 
[PHYSICAL-HOST]*N -> [ESXI-HYPERVISOR] -> [SUPERVISOR-CLUSTER] -> [SUPERVISOR]*3
                                                                  [AVI-CONTROLLER]*3
                                                                  [AVI-SE]*N
                                          [WORKLOAD-CLUSTER]*N -> [CONTROL-NODE]*3
                                                                  [NODE-POOL]*N
- The VM is a `Photon or Ubuntu` image purpose-built for K8s and the container runtime is `containerd` (Photon is default high-performance low-footprint linux flavor while Ubuntu is usually used for GPU access)
- The network architecture exists as 3 for VMWare traffic/services and 3 for VKS services
  - sizing for the network is very important at the start as it cannot be changed once the cluster is up and running
  - the sizing determines the number of pods/nodes/services the cluster can run
