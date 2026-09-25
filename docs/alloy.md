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

## Alloy Architecture

- The Alloy deployment via `k8s-monitoring` happens in three distinct phases
  - `management layer` - Alloy operator
    - the Alloy operator manages the lifecycle of kubernetes workloads in the collector layer
  - `collector layer` - Kubernetes workloads and Alloy pods
    - The kubernetes workloads actually creates and maintains Alloy pods
    - these workloads can be run in three different ways
      - `Deployment` - runs a set of interchangeable Alloy pods
      - `StatefulSet` - runs Alloy pods with stable identities (useful when multiple instances of Alloy must coordinate work distribution via clustering)
        - if we specify preset as `statefulsets` then it will create a statefulset with as many replicas as specified
      - `DaemonSet` - runs Alloy pods on each node (useful for node-level collection)
        - the `kepler` and `node-exporter` configurations create Daemon sets
  - `execution layer` - alloy processes and their component graphs
    - The alloy pods in the collector layer run the alloy process inside it
    - The process has different component graphs in it for each kind of telemetry
      - `prometheus.scrape` (receive metrics) -> `prometheus.relabel` (modify/filter metrics) -> `prometheus.remote_write` (write metrics to Mimir) for metrics
      - `loki.source.*` (collect logs) -> `loki.process` (process logs) -> `loki.write` (write logs to Loki) for logs
      - `otelcol.receiver.*` (receive traces) -> `otelcol.processor.*` (process traces) -> `otelcol.exporter.*` (send traces to Tempo) for traces
      - `pyroscope.scrape` (receive profiles) -> `pyroscope.process` (process profiles) -> `pyroscope.write` (write profiles to pyroscope) for profiles
    - These component graphs are configured to run inside the Alloy process by the configuration we do on the chart
    - Alloy then manages these component graphs on its own

## Alloy Telemetry collection

- Applications would have the OpenTelemetry dependency that pushes telemetry data to Alloy by specifying the Alloy endpoint on the app (push-based)
  - When Alloy receives the data, it detects what kind of data is and forwards it to the appropriate component graph to handle how to push it to the correct backend
- Mimir/Loki/Tempo/Pyroscope expose a /metrics endpoint that is discovered by Alloy from which metrics data is collected (pull-based)
  - we are not going to care about logs/traces/profiles from observability components as those are not very important for us
  - metrics could be important for us to decide how to configure these components so that we can use resources correctly

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
