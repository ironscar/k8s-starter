# Alloy

## Alloy Introduction

- Grafana Alloy is an open-source telemetry collector and a vendor-neutral distribution of Opentelemetry collector
- It consolidates collection, processing and export of logs, metrics, traces and profiles into a single agent
- It can replace having multiple collectors for different backends by doing all collection itself and sending data to any OTel-compatible backend as its 100% OTLP compatible
- It also has a rich configuration language
- Alloy is available from the `grafana/alloy` chart which allows users to configure a single instance of Alloy
  - but this doesn't woork for enterprise production workloads
- We will be using the `grafana/k8s-monitoring` chart
  - this is a meta-chart that uses a Kubernetes Operator for Alloy to deploy 5 specialized Alloy collectors

## Alloy Metrics Setup

- We will want to collect cluster metrics and pod metrics primarily and send them to Mimir
  - we will also collect Mimir's metrics (previously meta-monitoring but recommended to now do with k8s-monitoring)
- The values file `alloy-values.yaml` specifies a few things:
    - Destinations specify what destination to send metrics to
    - Collectors specify what collectors to be deploy for alloy
      - each collector may have multiple Alloy instances
    - it requires a write url like `http://<gateway-service-name>.<namespace>.svc.cluster.local/api/v1/push`
      - `svc.cluster.local` specifies its a service in the cluster's DNS domain
      - `api/v1/push` is the Prometheus write endpooint exposed by `mimir-gateway`
      - we also need to add `X-Scope-OrgID` to specify tenant id for mimir
  - Features specify the different kinds of metrics to enable collecting such as `clusterMetrics` or `costMetrics`
  - Telemetry services specify the supporting services needed to collect specific kinds of metrics such as `kepler`
      - Opencost needs a url like `http://<gateway-service-name>.<namespace>.svc.cluster.local/prometheus`
      - `prometheus/api/v1/query` is the Prometheus read endpooint exposed by `mimir-gateway`
      - `/api/v1/query` is automatically added by opencost
- Currently we have enabled collecting the following kinds of metrics:
  - cluster metrics like deployments, replicas etc
  - node metrics like CPU/memory consumption and energy metrics from kepler
  - cost metrics from opencost
- Then we install this chart with `helm install alloy -f alloy-values.yaml grafana/k8s-monitoring -n observability`
  - we can see opencost, node-exporter, kepler, kube-state-metrics and the operator pods running

Continue from https://chatgpt.com/c/6aa5d91f-8220-83e8-8793-5031a4af773c
