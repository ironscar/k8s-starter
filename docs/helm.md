# Helm Charts

## References

- https://helm.sh/docs/intro/
- https://medium.com/@jan.weyrich_81552/spring-boot-applications-with-helm-57d696cc0083
- https://devopsvoyager.hashnode.dev/understanding-helm-chart-dependencies-subcharts-external-dependencies-and-versioning

## Introducton

- Rancher desktop automatically installs Helm, so no need to install it separately
- Helm is a package manager which helps to find, share and use packages for Kubernetes
- Helm charts help define, install and upgrade complex Kubernetes apps
- Writing an app for Kubernetes implies writing and maintaining many manifest YAML files like deployments, services, configMaps etc
  - managing these by hand is repetitive and error-prone
  - Helm packages these related manifests into a single unit called a chart which can be versioned, shared, installed and rolled back together
- Some additional features of Helm:
  - Helm charts exist for databases, monitoring stacks etc so we don't have to manually put together the manifests for those complex setups
  - Helm allows configuring applications per environment without duplicating manifests
  - Helm allows declaring the other charts your apps depend on and then install them together
- Helm focuses on what runs on the cluster and not operating the control plane or data/worker plane of the cluster

## Main Components

- A `Helm Chart` is a package that includes everything needed to run the corresponding app
- A `Helm Repository` is a place where charts are collected and stored (public charts are stored on https://artifacthub.io)
- A `Release` is an instance of a chart running on the cluster, every instance on the cluster is created as a new release

## Searching and installing charts

### For public Helm charts

- We can search for a chart using `helm search hub <chartname>` which looks for charts in artifact hub (not in artifactory)
  - it normally only shows URL of the page but not the actual repo, for which we need to add a flag `--list-repo-url`
  - this search is fuzzy so it will match partial results as well
  - to search within locally added repos, we can use `helm repo list` and `helm search repo <chartname>`
- We cannot directly install public helm charts while on company laptop due to missing packages and old WSL version
  - an example is `helm install my-podinfo oci://ghcr.io/stefanprodan/charts/podinfo --version 6.14.1` but it seems to need a `libsecret` package (check Issues heading below)
  - to install it, we can follow the following steps:
    - we can pull public helm charts using `helm repo add <reponame> <charturl>` (both are specified on the charts page of artifacthub)
      - an example is `helm repo add stefanprodan https://stefanprodan.github.io/podinfo` (public ones currently have to be run outside of VPN)
    - after this, we can check our local charts as `helm repo list`
    - then if we want to see that particular chart in detail, we can run `helm show chart <reponame>/<chartname>` and `helm show values <reponame>/<chartname>`
      - an example is `helm show chart stefanprodan/podinfo` or `helm show chart stefanprodan/podinfo` respectively
    - finally, we can run `helm install <releasename> <reponame>/<chartname>` to run it in the cluster
      - an example is `helm install my-podinfo stefanprodan/podinfo`
      - we can also skip the releasename and ask helm to generate one with the `--generate-name` flag
- We can verify a chart running on cluster in multiple ways
  - do `kubectl get pods` to see the running pod
  - do a port-forward like `kubectl port-forward deploy/podinfo-1785984185 9898:9898` and check localhost on port `9898`
  - `helm ls` can show a list of all deployed releases
- To uninstall it from the cluster, we can run `helm uninstall <releasename>`
  - we can also run this command with a `--keep-history` flag so that helm tracks it within its deployment list
  - if used, we can see the uninstalled deployments using `helm ls --uninstalled`

### For TI Helm charts

Running on windows CMD instead of WSL2 is possible
  - run `helm registry login artifactory.itg.ti.com` and enterprise specify username password
  - then run `helm show chart oci://artifactory.itg.ti.com/helmoci-dc-charts-local/ticom-app-chart` and this finally works
  - then we can also pull a specific version of the chart to local as `helm pull oci://artifactory.itg.ti.com/helmoci-dc-charts-local/ticom-app-chart --version  0.18.8 --untar`

## Additional Information

- https://helm.sh/docs/intro/using_helm/#helm-install-installing-a-package section has the order of how Helm installs resources
- Helm doesn't wait till all resources are running before exit as it may sometimes take a long time to install
  - we can use `helm status <releasename>` to track the status of that release
- In general, all additional information is at https://helm.sh/docs/intro/using_helm/
- WSL2 and Windows maintain helm repositories separately as `helm repo ls` returns different outputs

## Customizing existing charts

- If we are using a chart that is already packaged and exists, installing it directly means we can only use it with default values
  - we can check default values with `helm show values <reponame>/<chartname>`
  - for example, we can try using `ui.color: #c1c887` (default is `#34577c`) with `helm install -f helm-deployments/podinfo/values.yaml stefanprodan/podinfo --generate-name`
    - same as before, we can port-forward it and we can see the UI color changes on `localhost:9898` with the custom message we added
    - if we want to check the values overridden for a specific release, we can do `helm get values <releasename>`
    - currently, the ingress is also configured to work with `/helm-podinfo` so we don't need the port-forward if that is there
      - this requires the `prefix` override in the `values.yaml` for podinfo, and then we can access it at `http://localhost:8080/helm-podinfo`
      - we have to use the port name in the traefik ingress instead of the port number (seems to be required because the service listens on a custom port like 9898 instead of a standard port like 80)

## Helm upgrade and rollback

- When a new version of a chart is released or when we want to change the config of a release, we can use `helm upgrade -f <values.yaml> <releasename> <reponame>/<chartname>`
  - taking the color change from default to new, we can do `helm upgrade -f helm-deployments/podinfo/values.yaml podinfo-1785986102 stefanprodan/podinfo`
  - this updates all the resources that maybe affected by the values overridden
  - this can technically allow changing the entire underlying chart while keeping the same release name
  - the `-f` flag can be used multiple times to specify multiple value files that override basic configurations
    - this is often used in environment overrides and the last one specified tends to have highest priority
- If we need to undo this because things didn't go well, we can do a rollback like `helm rollback <releasename> <revision>`
  - the current revision can be seen by running `helm status <revision>` (`revision` is a number and we would usually rollback to the `revision-1`)
  - an example is `helm rollback podinfo-1785986102 1`
  - the rollback still creates a new revision though
- We can see all the historical revisions with `helm history <release>` including any rollbacks to a specific revision in the `descrption` column

## Helm repositories

- Local repositories can be controlled by the `helm repo` command group
  - you can see all local repos with `helm repo list`
  - you can add new repos with `helm repo add <reponame> <charturl>`
  - you can update charts in repos with `helm repo update <reponame1> <reponame2>` (not specifying any repo names updates all)
  - you can remove a repo with `helm repo remove <reponame1> <reponame2>`

---

## Creating Helm Charts

- We can create new charts using `helm create <chartname>` which creates a new folder with the chart internally
  - we can run `helm lint <chartpath>` to check if linting is correct
  - we can run `helm package <chartpath>` to package the chart into a `tgz`
  - we can run `helm install <releasename> <tgzfile>` to install into cluster
- Once we create, it has the file structure like in `/helm-deployments/springweb/spring-app-chart`

### Main files

- These get automatically created by `helm create` command
  - `Chart.yaml` file contains metadata about the chart like name, type, version, appVersion, description etc
  - `values.yaml` file contains the default values for the chart's configuration options
  - `templates` folder contains the Kubernetes resources that comprise the application / library
  - `charts` folder contains any subcharts (dependencies) that the main chart relies on
- For manually added files and folders, important ones are
  - `envs` stores the env overrides with `values-{env}.yaml`

### Basic installation steps

- The Helm template uses Go's text/template library using placeholders to represent runtime variables 
  - we can represent variables in `values.yaml` like `{{ .Values.variableName }}`
  - we can represent variables in `Chart.yaml` like `{{ .Chart.VariableName }}`
    - chart variables need thier properties to start uppercase unlike values which follow the same case, else it doesn't pick up the value
  - the first dot is the root of the corresponding file
- we can refer to the vanilla `deployment.yaml` and build the template for deployment.yaml accordingly
- we can also update the `values.yaml` to have the variables used
- there are Helm extensions which can automatically validate the template files based on the chart variables
- we can do the same with the `service.yaml`
- Now we will lint and package this
  - this creates a `spring-app-chart-{version}.tgz` file
- When we install this onto the cluster and wait for a bit, we can now see the helm deployment for the spring app
- We can repeat the same with the NextJS app and see the UI on the cluster but now managed by Helm
- We can also test whether Helm is generating the actual manifests correctly or not using the template command
  - `helm template <dummy-release-name> <chart-path> <flags>` will output the manifest files that will get created
  - we can save the output by using `--output-dir <directory-path>`

## Helm templating functions

- In-built functions:
  - `quote` wraps the templated value in double-qoutes
  - `|` pipe is used to chain template expressions by taking output of first expression and feeding it to next
  - `split` is used to split a value based on a specific character
  - `index` takes the element at specified index of the input array
  - `toUpper` capitalizes a string
  - `{{ .Value.appName | split "-" | index 0 | toUpper | quote }}` takes the `appName`, splits it on `-` and returns element at index 0, capitalizes it and then wraps it in double-quotes
- Custom functions:
  - we can create custom functions either inline or in a `templates/_helpers.tpl` file
  - these can take only a single argument so multiple args require creating lists
  - the below syntax defines a function that uppercases or lowercases an input based on a condition and wraps it in double-quotes
  - if defined in a helpers file, can be used as `{{ include "toUpperOrLowerQuote" .Values.appName }}`
  - the `{{- ` and `-}}` are used to trim white spaces on either side of the definition (make sure to use these especially if you are indenting)

```YAML
{{- define "toUpperOrLowerQuote" -}}
  {{- if <condition> -}}
    {{- toLower | quote }}
  {{- else -}}
    {{- toUpper | quote }}
  {{- end -}}
{{- end -}}
```

---

## Setup configMap in charts

- Similar to deployment and service, we can create a configmap in the templates folder
- We can also update the deployment file to actually use the configMap
- Now, ideally we want to have the config properties in the `values.yaml` so we can define them under `appProperties`
- Then in the actual configMap, we can use the `toYaml` function to automatically convert the list into YAML format and then pipe that with `nindent 2` to add 2 space indent to generate the correct indentation
  - after making this change and adding a new variable, the pod didn't get injected with the new var because there were no changes to the deployment and the pod didn't get restarted to pull the updated values
  - once we run `kubectl rollout restart deployment/<deployment-name>` command with the corresponding deployment, it restarts the pod and pulls in the new variable as well
- If we wanted to make the pods restart on change to the configmap
  - we need to add a `checksum/config` annotation to the template deployment (refer `helm-deployments/springweb`)
  - the value is a sha256sum of the stringified version of `Values.appProperties`
  - this does something similar to the zero-downtime rollout restart when values in the configMap change

## Setup environment overrides

- We usually create a `env/<envname>` directory structure in the chart repository to cater to this
- The base `values.yaml` will have all defaults
- The environment-specific `values.yaml` will override those defaults
- If some property is overridden by all the environments, then we don't need to include it in the base file provided that we always use the chart with one of the environment configurations
- If we want to use this, we use `helm upgrade <release> -f <chartpath>/envs/values-<env>.yaml <chartpath>`

## Helm subcharts

- A helm subchart is a nested self-contained chart managed inside a parent chart
  - helps break large deployments into smaller reusable pieces
  - parent chart can override subchart values but subcharts cannot see parent values
- These are either directly stored in the `/charts` directory in the parent chart or specified as dependencies with the subchart directory link in the `Chart.yaml` of the parent chart
  - few patterns for this are: 
    - a subchart for the front-end and a subchart for the back-end of the same applicaiton
    - multiple microservices for a particular application, each having its own subchart
  - if the subcharts are externally maintained, then the repository specifies the helm chart path in registry
- After specifying dependencies, we need to go into the parent directory containing `Chart.yaml` and run `helm dependency build`
  - this packages the local subcharts as tgz files and puts it into the `/charts` directory of the parent chart
  - this also generates a `Chart.lock` file
- It is okay for a parent chart to not have any additional template files
- With this, we have created `k8s-appstack-chart` that packages both the Next font-end and Spring back-end app charts into a single Helm package
  - we package the pgdb1 external service to be part of the `spring-app-chart` in a new service file called `service-db.yaml` so that installing spring-app-chart will also create the external service
- To override subchart values from parent chart
  - we can create a section in the `values.yaml` with the subchart name and override variables specified by the subchart
  - we can also define a section called `global` and this will go to all subcharts equally

---

## Interesting caveats

- In Helm during upgrades, if one release has overridden certain values and the next upgrade doesn't specify any value overrides for that property, then it won't automatically take the default chart values
  - instead it will take the last revision's value as is
    - this is because it defaults to using a flag called `--reuse-values` if no value files are specified
    - if we want to specifically want to use all default chart values, then we need to use `--reset-values`
  - but if a values file is specified and a overridden property is removed from the file, then that value will go back to the default and not the last revision value
  - for this, we can use helm upgrade command with `--dry-run` flag which validates the current templates with what is actually on the cluster
    - the flag takes values `client` or `server`
      - `client` validates it on client-side after pulling cluster information (faster)
      - `server` validates it on server-side by executing it against the resources in the cluster (robust)
      - in this case, both give the same output which is correct
    - this works better than `helm template` which is purely on-client validation and knows nothing about the current state of the cluster and thus, gives the wrong output

---

## Issues

- Cannot directly `show chart` or `show values` from artifactory due to `libsecret` package missing from WSL CentOS
  - it doesn't support `repo add` so need to resolve this
  - downloaded libsecret manually from https://buildlogs.cdn.centos.org/c7.1810.00.x86_64/libsecret/20181030174549/0.18.6-1.el7.x86_64/*
  - ran `sudo rpm -ivh libsecret-0.18.6-1.el7.x86_64.rpm` to install it
- Now libsecret is successfully installed, which we can check by `rpm -qi libsecret` but we are back to the timeout on WSL [COULD-NOT-FIX]
- There are more missing packages owing to CentOS version on WSL2 being too old [COULD-NOT-FIX]
- Currently falling back to public packages by `helm repo add` from WSL and TI packages by `helm pull` from Windows CMD
