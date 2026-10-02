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
- If wew wanted to make a specific visualization like the CPU core utilization over time per node, we would need something like the below query
  - `avg by(instance) (100 - (100*rate(node_cpu_seconds_total{mode="idle"}[5m])))`
  - this multiplies the rate above for idle mode by 100 and subtracts from 100 to get the percentage
  - then splits it out by the instance
- If we wanted to find the CPU core % utilization of a specific container, we could use below query
  - `100*rate(container_cpu_usage_seconds_total{container="<container_name>"}[5m])`
  - we can use container_name as `ingester` as there are multiple replicas of this running
  - we don't average here as the same container can be running across multiple pods and we want to see is how much each distinct container consuming
  - a container using 2 full CPU cores will show 200%
- Once we are happy with our query, we can `Add to Dashboard` fromt the `Add` button
  - create a new dashboard with a title and description
  - then we can hover on this and press `V` to view it fullscreen
  - save it and then we can view the new dashboard under `Dashboards` tab

Continue from https://chatgpt.com/c/6aa5d91f-8220-83e8-8793-5031a4af773c
