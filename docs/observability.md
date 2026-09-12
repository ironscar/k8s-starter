# Kubernetes Observability Stack

## LGTM Component Stack

---

## Installing LGTM components

- `kubectl create ns observability` to create a new namespace to deploy the LGTM stack components (start from `helm-deployments/observability`)
- `helm repo add grafana https://grafana.github.io/helm-charts` to add the repository which contains all the charts

### Install Mimir

#### Classic Architecture

- We will begin by inistalling Mimir in classic architecture (as below):
  - we can see what all sub-components this will install by running `helm template mimir grafana/mimir-distributed -f mimir/mimir-classic-values.yaml -n observability > mimir/mimir-rendered.yaml`
- Mimir has two major paths: [TO-CONTINUE]
  - https://chatgpt.com/c/6aa5d91f-8220-83e8-8793-5031a4af773c
- Run `helm install mimir -f mimir/mimir-classic-values.yaml grafana/mimir-distributed -n observability` to install Mimir in distributed mode in the `observability` namespace
