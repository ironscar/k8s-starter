# Grafana

## Grafana Introduction

- Grafana is the front-end for all the metrics, logs and traces collected by Mimir, Loki and Tempo

## Installing Grafana

- We can see the default values using `helm show values grafana-community/grafana > default-values.yaml`
- We can see the K8s resources created using `helm template grafana -f grafana-values.yaml grafana-community/grafana -n observability > grafana-rendered.yaml`
- Install Grafana using `helm install grafana -f grafana-values.yaml grafana-community/grafana -n observability`
  - this also enables the ingress
- Admin user is `admin` and it also creates a secret resource on Kubernetes called `grafana`
  - we can get the decoded password using `kubectl get secret grafana -o jsonpath='{.data.admin-password}' | base64 --decode`

## Integrate with Mimir

- After login, we can go to the `Connections` and add the `Prometheus` plugin (installed)
  - don't click update as it fails and seems to unload the plugin
- This takes us to configuring the datasource
  - url: `http://mimir-gateway.observability.svc.cluster.local/prometheus`
  - add Http Header under Authentication: `X-Scope-OrgID` with value `my-org-id`
- Then clicking `Save and Test` confirms a succcessful connection
- We can then go to the `Metrics Drilldown` page and see various charts for the metrics

Continue from https://chatgpt.com/c/6aa5d91f-8220-83e8-8793-5031a4af773c
