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

## Interpreting metrics from Mimir

- We can go to the `Drilldown > Metrics` tab for starters
- Then we can select a specific metric such as `node_cpu_seconds_total` which says what is the cumulative CPU time in seconds used by that node
- This has multiple breakdowns by each label such as `workloads`, `pods`, `instance` etc 
  - some of these have more breakdowns
  - if we select `instance`, it will show the metric breakdown per instance (node)
    - each node also has a label identifying the node
  - if we select `mode`, it will show the breakdown per cpu mode like `idle` or `user` etc
    - this specifies what mode was the CPU actually running in
- So to use this, lets head to the `Explore` tab and select `Code` at the right top roughly (builder is a little too click-heavy)
  - we will specify a PromQL like `rate(node_cpu_seconds_total[5m])` implying rate of growth of `node_cpu_seconds_total` per second over last 5 minutes
  - this draws a chart and if we hover over the chart points, we can see the labels of that particular point like `mode` and `instance` along with its actual rate value
  - if we see an entry saying `mode = idle, value = 0.91` => at that time, 91% CPU core usage per second averaged over the last 5 minutes is idle
- If we wanted to make a specific visualization like the CPU core utilization over time per node, we would need something like the below query
  - `avg by(instance) (100 - (100*rate(node_cpu_seconds_total{mode="idle"}[5m])))`
  - this multiplies the rate above for idle mode by 100 and subtracts from 100 to get the percentage
  - then splits it out by the instance
- If we wanted to find the CPU core % utilization of a specific container, we could use below query
  - `100*rate(container_cpu_usage_seconds_total{container="<container_name>"}[5m])`
  - we can use container_name as `ingester` as there are multiple replicas of this running
  - we don't average here as the same container can be running across multiple pods and we want to see is how much each distinct container consuming
  - a container using 2 full CPU cores will show 200%
- Once we are happy with our query, we can `Add to Dashboard` from the `Add` button
  - create a new dashboard with a title and description
  - then we can hover on this and press `V` to view it fullscreen
  - save it and then we can view the new dashboard under `Dashboards` tab

---

## Building a Grafana Dashboard

- We start with fundamental questions
  - `Availability & Health`: Is it working? Are nodes and pods up? Are there too many restarts?
  - `Utilization`: How much CPU, memory, disk is being used and how much remains?
  - `Saturation & Constraints`: Are pods stuck waiting for CPU or killed for OOM-killed?
  - `Trends & Anomalies`: Is CPU usage steadily increasing? Is available memory falling, are restarts and errors becoming more common?
- We will attempt to build a full dashboard on Grafana for a demo application stack
  - Phase 1 — Node metrics: CPU, memory, disk, network, and node health.
  - Phase 2 — Kubernetes and pod metrics: Pod health, restarts, scheduling, and requests/limits.
  - Phase 3 — Container metrics: CPU, memory, throttling, and resource constraints. No app instrumentation needed.
  - Phase 4 — Application instrumentation: Add and validate Spring and Next.js application metrics.
  - Phase 5 — PostgreSQL metrics: Connections, query performance, locks, and health.
  - Phase 6 — Metrics-based troubleshooting and dashboard consolidation: Investigate cross-layer symptoms, finalize useful panels, and configure appropriate alerts.
- We will simplify the current distributed Mimir setup to use fewer resources
  - we create a new `mimir-dev.yaml` to run mimir in monolithic mode as an external docker container
  - `docker run -d --name mimir-monolithic --restart unless-stopped -p 9009:9009 -v "$(pwd)/mimir/mimir-dev.yaml:/etc/mimir/mimir.yaml:ro" -v mimir-data:/data grafana/mimir:latest -target=all -config.file=/etc/mimir/mimir.yaml`
  - then we update `alloy-values.yaml` to have the wrote endpoint as `http://host.k3d.internal:9009/api/v1/push`
  - finally we update the Grafana connector URL to `http://host.k3d.internal:9009/prometheus`
  - if metrics are still visible on Grafana, we can uninstall mimir-distributed
  - mimir-distributed was using about 650MB RAM whereas this docker container is just using 85MB, which saves quite a bit

### Phase 1: Node Metrics

Continue from https://chatgpt.com/c/6aa5d91f-8220-83e8-8793-5031a4af773c
