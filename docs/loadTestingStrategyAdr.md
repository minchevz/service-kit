## Load test setup for the services

### Use case

### Load testing setup requirements:

[Jira ticket](https://jira.gamesys.co.uk/browse/GTECH-70870)

Complete setup that:

*   Should be able to trigger tests on-demand manually
*   mock external dependencies (so we can test service in isolation)
*   Able to execute performance and load test by passing different configurations (assuming Vus, etc.)

****Considerations:****

*   The setup should be known and easy to maintain by unicorn devs
*   Passing additional parameters and running the tests on demand shoud not be complicated/error prone
*   Result from the load test runs should be easily accessible
*   Tests should be able to be ran against anvironment by choice
*   Ideally running the tests should be able to be decoupled from the deployment pipelines.

#### Investigation

**### Considered Options:**

- [Custom built docker image off of k6 deployed together with each service](#custom-built-docker-image-off-of-k6-deployed-together-with-each-service)

* [Steps:](#steps--1)

* [Positives:](#positives--1)

* [Drawbacks:](#drawbacks--1)

- [Use the experimental k8 k6 repo](#use-the-experimental-k8-k6-repo)

* [Steps:](#steps--2)

* [Positives:](#positives--2)

* [Drawbacks:](#drawbacks--2)

- [Running k6 action with a hosted runner on inception against prs inside the service repos](#running-k6-action-with-a-hosted-runner-on-inception-against-prs-inside-the-service-repos)

* [Steps:](#steps--3)

* [Considerations for the runners:](#considerations-for-the-runners-)

* [Positives:](#positives--3)

* [Drawbacks:](#drawbacks--3)

#### Custom built docker image off of k6 deployed together with each service

Similar to this post - https://community.k6.io/t/running-k6-in-a-kubernetes-environment/51/3

Tldr; Deploy an additional k6 image on PP containing loadTest folder.

##### Steps:

- build an image from k6 and put tests folder in it (currently there's a POC in games-master-service)

- only build the image if there are changes to the test folder

- copy deployment playbook and add the new k6 image to be deployed in there

- add rule in ansible deploy template (in unicorn-tower-bootstrap) for the environment on which we want k6

- Talk ot PEG to connect to influxDb and grafana from k6

- once the app is deployed with the k6 image:

- the tests will run once on every deploy as part of the pipeline

- could cater for passing arguments from pipeline to the image before running the tests

##### Positives:

- We have complete control over the build and the process

- Image lives with the service

- no separate deployment pipeline

- easily transferable to inception (once we figure out putting k8 there)

##### Drawbacks:

*   **No ability to manually run the tests on demand. At best/worst they can run as part of each service deploy which might be unnecessary**
*   **To change the testing ENV the deployment configuration/pipelines would need to be modified.**
*   Any change to tests requires a merge and deploy, making it difficult to do trial tests.
*   We'll be generating docker images (at least one) for each service that will live in artifactory, but are mostly throwaway.
*   The load tests will be running on the same env the service is deployed to, meaning results may be skewed as it will be using the same resources.

#### Use the experimental k8 k6 repo

Tldr; K6 are currently working on a solution for running distributed k6 tests on k8.

There is an experimental k6 operator deploy to kubernetis developed by k6 - https://k6.io/blog/running-distributed-tests-on-k8s

repo - https://github.com/k6io/operator

##### Steps:

*   Setup and deploy an operator to the int (later ppc) k8 cluster
*   Create script that can translate the tests into configmap (additional work around automating this process is required)
*   Create custom resource (this takes in as params the congfigmapped tests and any arguments that need to be passed to k6 - )
*   Figure out a way (possibly a script) to pass in arguments to the custom resource
*   Applying the config above as part of running the tests (needs looking into)
*   Additional work to connect to influxDb and grafana from k6
*   Preferable to have setup and tear down script for operator deploy and uninstall (this can be done later)

##### Positives:

- no docker image deploys

- less overhead for developers

##### Drawbacks:

*   bit of a black box
*   experimental repo (unstable with possible breaking changes)
*   additional work around automating the script that translates the tests to config map.
*   running with passing custom arguments from possibly the pipeline will be cumbersome and error prone

#### Running k6 action with a hosted runner on inception against prs inside the service repos

This option is also good as an addition to one of the solutions above

Tldr; Setup a workflow inside each repo that can be triggered on demand/or on certain condition if desired, against branches and PRs

##### Steps:

*   setup an action runner on Unicorn inception space that can run docker (done - in draft pr https://github.gamesys.co.uk/PlayerServices/unicorn-infrastructure/pull/68)
*   create github action that runs on pr (testPR by Alex Nisah - repo and success run https://github.gamesys.co.uk/PlayerServices/github-actions-test/runs/4558?check_suite_focus=true)
*   Workflow to accept passing pass explicitly Vu, environments, branches and other params to the action itself.
*   Additional work to connect to influxDb and grafana from k6

##### Considerations for the self-hosted runners:

*   The runners run as a services on a vm. This means a vm on inception can register and be running multiple runners. This need to be taken into account when deciding what resources the vm needs to have.
*   It may be a good approach to have a vm running a few dedicated load-testing action runners (on org level - for example PlayerServices) that can be used for running the load testing actions. There's currently one setup for PlayerServices - https://github.gamesys.co.uk/organizations/PlayerServices/settings/actions. **However those runners will be shared across all services that we want to load test under the same organisation** - this should be considered when deciding on number of runners and if there will often be the case that multiple load tests will be running simultaneously on those runners.
*   The runners run each job consecutively (there is no parallel execution of jobs per runner)
*   the org level runners run ony on private repos.
*   more info on the runners - https://docs.github.com/en/actions/hosting-your-own-runners/about-self-hosted-runners

##### Positives:

*   Super easy and maintainable
*   No extra complexity
*   Workflows live with the repo, and is easier to keep up to date
*   Easy to change what env, branch and with what params the tests are ran
*   Not necessary to deploy to change tests or test params
*   Workflow can be triggered manually or set to run on certain event (changing requires minimal work)
*   Results from each test run are kept and accessible in the service repo
*   Good as standalone or compliment to one of the solutions above
*   Connection times between inception and PP/INT are negligeable
*   Running k6 setup itself doesn't consume PP/INT resources

##### Drawbacks:

*   Since the runner is hosted on an inception machine and not on a k8 cluster, resources can not be allocated on the fly if necessary. The available resources are determined and limited to the ones chosen at machine creation time.
*   The runner will be connecting to the service(that is being tested) deployed on PP/INT:
    *   Any new endpoints that need to be tested needs to be deployed first
    *   Need to use proxy to connect to services running on PP envs.

##### Decision

After evaluating the proposed options and further discussion with Steven Dawe, Vishnu Khandavalli, Tolis Christomanos and Allix D`Arcy it was decided to proceed further with the github Workflow approach as it provided us with most of the things we wanted for relatively not a lot of work and not a lot of future maintanace cost.

##### Action runner and machine

#### Implementation

*   A new machine was provisioned on unicorn inception space [unicorn-load-test-runner](https://openstack.pgt01.gamesysgames.com/dashboard/project/instances/a56fe545-f59f-47bd-8d02-0cc258195219/) with enough resources to satisfy Unicorn's current load test needs:

```
Flavor Name
  e1.spc.xlarge
Flavor ID
  91b7a3ae-d785-445d-b673-ffc266fea9ef
RAM
  32GB
VCPUs
  16 VCPU
Disk
  40GB
```

The configuration of the machine can be found in the [unicorn-infrastructure-repo/projects/terraform-openstack/unicorn-load-test-runner](https://github.gamesys.co.uk/PlayerServices/unicorn-infrastructure/tree/master/projects/terraform-openstack/unicorn-load-test-runner) and respectively

any tasks running on this machine can be found here [unicorn-infrastructure/ansible-openstack/unicorn-load-test-runner](https://github.gamesys.co.uk/PlayerServices/unicorn-infrastructure/tree/master/projects/ansible-openstack/unicorn-load-test-runner).

*   Following this, a github action runner [Unicorn load test runner](https://github.gamesys.co.uk/organizations/PlayerServices/settings/actions) was registered for unicorn in the PlayerServices org so it is available for all Unicorn service repositories living under PlayerServices.

The action runner itself is a service that is registered and runs on the provisioned openstack vm.

There are tasks to [add and register](https://github.gamesys.co.uk/PlayerServices/unicorn-infrastructure/blob/master/projects/ansible-openstack/unicorn-load-test-runner/tasks/addSelfHostedRunner/main.yml) and [deregister and remove](https://github.gamesys.co.uk/PlayerServices/unicorn-infrastructure/blob/master/projects/ansible-openstack/unicorn-load-test-runner/tasks/deregisterSelfHostedRunner/main.yml) a runner with the configuration for the runner being added, living in a [vars file](https://github.gamesys.co.uk/PlayerServices/unicorn-infrastructure/blob/master/projects/ansible-openstack/unicorn-load-test-runner/vars/self-hosted-runner-vars.yml ) ). The name, token and labels will be read from here and used by the register and deregister tasks.

As there are some limits on the machine itself that can be hit, and following the recommended approach from [k6 docs](https://k6.io/docs/misc/fine-tuning-os/), there is an additional task for [fine-tunning for larger tests](https://github.gamesys.co.uk/PlayerServices/unicorn-infrastructure/blob/master/projects/ansible-openstack/unicorn-load-test-runner/tasks/osTuningForLargeTests/main.yml).

All the tasks are run from the [playbook.yaml](https://github.gamesys.co.uk/PlayerServices/unicorn-infrastructure/blob/master/projects/ansible-openstack/unicorn-load-test-runner/playbook.yaml) with providing the command for the specific task that you wish to run - [example](https://github.gamesys.co.uk/PlayerServices/unicorn-infrastructure/blob/master/projects/terraform-openstack/unicorn-load-test-runner/Makefile#L25).

**Why are we hosting our runner and not using the Github ones?:**

1.  Using Github runners is not yet available for Github enterprise.
2.  The [resources of the runners provided by Github](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners#supported-runners-and-hardware-resources) is lower than what our current self-hosted runner has. However if/when they become available and we have had more time to determine if we need more or less resources for runnig the test, this can be re-evaluated.

**Can we host more than one runner on the same machine?:**

Since we'd like to have the ability to use the whole capacity of the vm per load test run it was decided that only one runner will be running on this machine.

##### .githubWorkflow

With the machine and runner setup all that's needed for the load tests is a workflow, that lives in the service repo. As part of the initial implementation there are a couple of workflows ([stress-test.yaml](http://[stress-test.yaml](https://github.gamesys.co.uk/PlayerServices/service-kit/blob/master/packages/service-kit-generator/template/.github/workflows/stress-test.yaml) and [stress-test-via-proxy.yaml](http://stress-test.yaml and [stress-test-via-proxy.yaml](https://github.gamesys.co.uk/PlayerServices/service-kit/blob/master/packages/service-kit-generator/template/.github/workflows/stress-test-via-proxy.yaml)) in service-kit/template which will be added to each new service generated with the service-kit/template-generator.

Both of those use the [self-hosted runner](https://github.gamesys.co.uk/PlayerServices/service-kit/blob/master/packages/service-kit-generator/template/.github/workflows/stress-test.yaml#L32) and take as parameters the ENV and endpoints for the tests to run on as well as a repository branch (master is default).

Those workflows are also part of the [content-aggregation](https://github.gamesys.co.uk/PlayerServices/content-aggregation-service/tree/master/.github/workflows) and front-[content-aggregation](https://github.gamesys.co.uk/PlayerServices/content-aggregation-service/tree/master/.github/workflows) services.

##### What the current solution gives us

*   The setup is easy to be maintained by unicorn devs.
*   Workflows live with the repo, and is easier to keep up to date.
*   Tests can be run on demand from the github UI against any ENV, branch and endpoint without need to deploy. Deploying is only necessary for newly created endpoints.
*   Running the tests is decoupled for the deployment pipelines.
*   Result from each load test run is available under the actions tab in the corresponding service repo - [example for CAS load test run](https://github.gamesys.co.uk/PlayerServices/content-aggregation-service/actions/runs/3272)
*   Workflow can be triggered manually or set to run on certain event (changing requires minimal work)
*   Good as standalone or compliment to one of the solutions above
*   Connection times between inception and PP/INT are negligeable
*   Running k6 setup itself doesn't consume PP/INT resources during testing

##### Drawbacks

*   The runner will be connecting to the service(that is being tested) deployed on PP/INT:
    *   This means that when running load tests against the PP environments, we need to use a proxy to connect to the service being tested. By doint that however for large tests we get limited by it. Because of that, we either:
        *   run the tests against INT
        *   or run them against PPC but as if going from the "outside" via nginx instead rather than usign the proxy.
*   Since the runner is hosted on an inception machine and not on a k8 cluster, resources can not be allocated on the fly if necessary. The available resources are determined and limited to the ones chosen at machine creation time. As a result we've chosen to allocaret as much resources as we could get for the runner, meaning that when no tests are being done those resources remain allocated and unusable.

##### Future work

*   Store load tests results in Grafana, for observability.

K6 uses influxDB to store test results.

During the implementation we discovered that we can't use the Grafana dashboard that PEG has as they use Graphite and not influxDB to feed data to Grafana. This meant that we'd need to host our own Grafana instance on openstack, that will store the results of each load test run separately for each service having the load test workflow.

Giuseppe Rugierri condiunted initial investigation for spinning up a Grafana instance [GTECH-74947](https://jira.gamesys.co.uk/browse/GTECH-74947) - [POC on openstack](https://openstack.pgt01.gamesysgames.com/dashboard/project/instances/b36f181d-ace9-43c8-a234-58a71e2ef976/) and [code in the infrastructure repo](https://github.gamesys.co.uk/PlayerServices/unicorn-infrastructure/tree/master/projects/terraform-openstack/grafana-dashboard).

There is additonal work left to use or recreate the POC and maintain an instane for the unicorn services.

Challanges:

*   *   Separating the load test data by service and displaying it.
    *   Connection between the machine where the load test action runner is hosted and the machine where the Grafana dashboard will live - altho the machines are in the same network and there should not be issue with connection there might be some unknowns.

k6 Grafana guide here - [https://k6.io/blog/k6-loves-grafana](https://k6.io/blog/k6-loves-grafana).