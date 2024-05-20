# core-session-service handbook

<div align="center">
  <a href="/" title="Feas API">
    <img alt="core-session-service API" src="./docs/resources/core-session-service.png" height="150px" width="300px" />
  </a>
  <br />
  <h1>core-session-service</h1>
</div>


<p align="center">
   Node.js Koa RESTful Backend-For-Frontend microservice with Docker, Swagger, Typescript, Jest, Go CI, Jenkins and NexusIq.
</p>

<div align="center">
  <a href="https://gocd.psunicorncd.pgt.gaia/go/pipelines?viewName=gm2#!/">
    <img alt="GoCI" src="https://img.shields.io/badge/GoCI%2FCD-passing-brightgreen" />
  </a>
  <a href="/">
    <img alt="npm" src="https://img.shields.io/badge/dependencies-up%20to%20date-brightgreen" />
  </a>
  <img src="./docs/resources/unicornteam.svg">
  <img src="./docs/resources/nodeversion.svg">
</div>

<br />

**core-session-service**
Test Session Service
Backend-For-Frontend API application with Koa ,generated with Service-Kit [unicorn microservice library](https://github.gamesys.co.uk/PlayerServices/service-kit).

This include the following:

- Logging to STDOUT/STDERR stream using [Winston](https://github.com/winstonjs/winston/)
- Config management like env variables, is managed by [convict](https://github.com/mozilla/node-convict/tree/master/packages/convict)
- A super small and optimized [Docker](https://www.docker.com/) image based on [Docker files](./docs/docker.md).
- [Swagger](https://swagger.io/) API documentation based on JSDoc
- Continuous integration and delivery using [GoCI](https://www.gocd.org/)
- Unit Test and Integration Test along with Test Coverage using [Jest](https://facebook.github.io/jest/) testing framework

---

## Table of contents

- [General info](#core-session-service)
- [Technologies](#technologies)
- [Environments](#environments)
- [Monitoring](#monitoring)
- [Load Testing](#Load-testing)
- [Setup](#setup)
  - [Configuration](#Configuration)
  - [Local](#local)
  - [Docker](#docker)
  - [Test](#test)
- [Rules](#rules)
  - [Hooks Workflows and Rules](#hooks)
- [Docs Links](#docs-links)
- [Deployment](#deployment)
- [Working with Unicorn](#working-with-unicorn)
- [Contributing](./CONTRIBUTING)

---

## Technologies

- [Typescript](https://www.typescriptlang.org/)
- [Koa](https://koajs.com/)
- [Jest](https://jestjs.io/)
- [Jenkins](https://www.jenkins.io/)
- [GoCD/CI](https://gocd.psunicorncd.pgt.gaia/go/pipelines?viewName=gm2#!/)
- [NexusIq](https://nexusiq.gamesysgames.com/assets/index.html#/dashboard/applications)
- [Kubernetes](https://kubernetes.io/)
- [Docker](https://www.docker.com/)
- [Dynatrace](https://www.dynatrace.com/)
- [Splunk](https://www.splunk.com/)
- [K6 load testing](https://k6.io/)

---
## Environments

| Environment | Url                                                            |
| ----------- | ---------------------------------------------------------------|
| int03       | http://core-session-service.int03.integration.pgt.gaia  |
| int08       | http://core-session-service.int08.integration.pgt.gaia  |
| int10       | http://core-session-service.int10.integration.pgt.gaia  |
| ppc1        | http://core-session-service.stg.pp1.pgt.gaia            |
| ppc2        | http://core-session-service.stg.pp2.pgt.gaia            |
| ppc21       | http://core-session-service.stg.pp21.pgt.gaia           |
| ppc22       | http://core-session-service.stg.pp22.pgt.gaia           |
| prod eu     | http://core-session-service.prod.l1.inx.gaia            |
| prod nj     | http://core-session-service.prod.l1.trop.gaia           |
| prod az     | http://core-session-service.prod.l1.usaz1.gaia          |
| prod ny     | http://core-session-service.prod.l1.usny1.gaia          |


> Node : For ppc2 and live environments proxy is needed curl -x http://10.149.16.141:3546

---
## Monitoring

- [Int03 Logs](https://splunk.int03.integration.pgt.gaia/en-US/app/search/search?q=search%20index%3Dunicorn%20core-session-service%20sourcetype%3D%22k8s.int03%22&display.page.search.mode=smart&dispatch.sample_ratio=1&workload_pool=&earliest=rt-5m&latest=rt&display.prefs.events.count=10&sid=rt_1646826055.546813)
- [Int08 Logs](https://splunk.int08.integration.pgt.gaia/en-US/app/search/search?q=search%20index%3Dunicorn%20core-session-service%20sourcetype%3D%22k8s.int08%22&display.page.search.mode=smart&dispatch.sample_ratio=1&workload_pool=&earliest=rt-5m&latest=rt&display.prefs.events.count=10&sid=rt_1646826040.546802)
- [Int10 Logs](https://splunk.int03.integration.pgt.gaia/en-US/app/search/search?q=search%20index%3Dunicorn%core-session-service%20sourcetype%3D%22k8s.int10%22&display.page.search.mode=smart&dispatch.sample_ratio=1&workload_pool=&earliest=rt-5m&latest=rt&display.prefs.events.count=10&sid=rt_1651592201.2381246)
- [PPC2 Logs](https://srch00.pgt01.gamesys.corp:8000/en-US/app/search/search?q=search%20index%3Dunicorn%20core-session-service%20sourcetype%3D%22k8s.ppc2%22&display.page.search.mode=fast&dispatch.sample_ratio=1&earliest=-15m&latest=now&display.page.search.tab=events&sid=1646825984.141804_DAABCFC5-A58D-46D6-B3DD-6AEEB0A65477)
- [PP21 Logs](https://srch00.pgt01.gamesys.corp:8000/en-US/app/search/search?q=search%20index%3Dunicorn%20core-session-service%20sourcetype%3D%22k8s.pp21%22&display.page.search.mode=fast&dispatch.sample_ratio=1&earliest=-15m&latest=now&display.page.search.tab=events&sid=1646826087.141865_DAABCFC5-A58D-46D6-B3DD-6AEEB0A65477)
- [PP22 Logs](https://srch00.pgt01.gamesys.corp:8000/en-US/app/search/search?q=search%20index%3Dunicorn%20%7B%7Bgenerated_service_name%7D%7D%20sourcetype%3D%22k8s.pp22%22&display.page.search.mode=fast&dispatch.sample_ratio=1&earliest=-15m&latest=now&display.page.search.tab=events&sid=1651592272.294872_ACEE8207-F78F-4059-9CBD-1BFA7476C4FA)
- [Live EU Logs](https://srch00.inx01.gamesys.corp:8000/en-US/app/search/search?q=search%20index%3Dunicorn%20front-end-auth-service%20sourcetype%3D%22k8s.live_eu%22&display.page.search.mode=smart&dispatch.sample_ratio=1&earliest=-24h%40h&latest=now&sid=1649274870.506698_EC3FD98E-924A-4A40-A267-CB995CC0AC51)
- [Live NJ Logs](https://splunk.prod.root.trop.gaia/en-GB/app/search/search?q=search%20index%3Dunicorn%20core-session-servicee%20sourcetype%3D%22k8s.live_nj%22&display.page.search.mode=smart&dispatch.sample_ratio=1&earliest=-15m&latest=now&display.general.type=events&sid=1651593913.914659)
- [Live AZ Logs](https://splunk.prod.root.usaz1.gaia/en-GB/app/search/search?q=search%20index%3Dunicorn%20core-session-service%20sourcetype%3D%22k8s.live_nj%22&display.page.search.mode=smart&dispatch.sample_ratio=1&earliest=-24h%40h&latest=now&sid=1651593955.328301)
- [Live NY Logs](https://splunk.prod.root.usny1.gaia/en-GB/app/search/search?q=search%20index%3Dunicorn%20core-session-service%20sourcetype%3D%22k8s.live_nj%22&display.page.search.mode=smart&dispatch.sample_ratio=1&earliest=-24h%40h&latest=now&sid=1651593997.5102)

- [Int03 Dynatrace](https://hdz48658.live.dynatrace.com/#newservices)
- [Ppc2 Dynatrace](https://apg81144.live.dynatrace.com/#newservices)
- [Live Dynatrace](https://qvn05441.live.dynatrace.com) // update link

- [All Unicorn Services-Live](https://qvn05441.live.dynatrace.com/#dashboard;gtf=defaultTimeFrame;gf=defaultManagementZone;id=abb1705b-65e7-4e59-83e3-8f55eb3024f4)
- [Int Deployments](https://splunk.int03.integration.pgt.gaia/en-US/app/monitoringkubernetes/kube_deployment?form.period.earliest=-60m%40m&form.period.latest=now&form.refresh=0&form.kubernetes_cluster_eval=*&form.kubernetes_node_label=*&form.kubernetes_deployment_labels=*&form.kubernetes_namespace=unicorn&form.kubernetes_deployment_id=*)
- [PPC Deployments](https://srch00.pgt01.gamesys.corp:8000/en-US/app/monitoringkubernetes/workload?form.workload=deployment&form.kubernetes_workload_id=*&form.kubernetes_namespace=unicorn&form.period.earliest=-60m%40m&form.period.latest=now&theme=dark&form.refresh=0&form.span=1m&form.kubernetes_cluster_eval=*&form.kubernetes_node_label=*&form.kubernetes_workload_labels=*%22%20OR%20host%3D%22*)

---
## Load Testing
The services load testing setups are based on [k6 performance tool](https://k6.io/).
Every endpoint has its own rules and thresholds to pass. [example load testing setup](./test/load/config/getGameConfig.js).

### Connecting to load-test-runner vm and action-runner vm

actions-runner:
```zsh
ssh root@10.124.196.20 -i ~/.ssh/unicorn_master_key.pem
```
unicorn-load-test-runner:
```zsh
ssh root@10.124.148.10 -i ~/.ssh/unicorn_master_key.pem
```

### k6 load testing:
 - repo: https://github.com/k6io/k6
 - k6 operator: https://github.com/k6io/operator
 - self-hoster runner in k8: https://sanderknape.com/2020/03/self-hosted-github-actions-runner-kubernetes/
 - Grafana & influxDb setup: https://k6.io/blog/k6-loves-grafana
 - GithubActions:
    - how: https://k6.io/blog/load-testing-using-github-actions
    - action: https://github.com/marketplace/actions/k6-load-test
 - Constant req rate: https://k6.io/blog/how-to-generate-a-constant-request-rate-with-the-new-scenarios-api/
 - Running large tests: https://k6.io/docs/testing-guides/running-large-tests/


### How to run the load tests?
After the PR is merged on master branch , on github-actions choosing the [**stress-test** flow](https://github.gamesys.co.uk/PlayerServices/content-aggregation-service/actions?query=workflow%3A%22Stress+Test%22) . Then in **run workflow** options, the required endpoint or environment has to be selected to run.

---
## Setup

```zsh
$ npm install yarn
```

### Configuration

Add a `.env` file to the root of the project to set Environment Variables, e.g.

```properties
PORT=5001
LOG_LEVEL=debug
```

### Local Development

```zsh
$ brew install redis

$ redis-server
```

```zsh
$ yarn
$ yarn start
```

### Test

All test for this boilerplate uses following tools.

- [Jest](https://github.com/facebook/jest)
- [supertest](https://github.com/visionmedia/supertest) - Easy HTTP assertions for integration test

```zsh
# Test
$ yarn test                           # Run only unit test
$ yarn test:integration               # Run only integration test
# Test (Watch Mode for development)
$ yarn test:watch                     # Run all test with watch mode
$ yarn lintify                        # Lint all sourcecode
$ test:load                           # Run endpoint load-test with k6
```
Load testing requires k6, install with homebrew:

`brew install k6`

---
## Rules
  **ᕦ⊙෴⊙ᕤ**
### Hooks
  The repo is using [husky](https://github.com/typicode/husky) to run pre-commit and pre-push hooks.
  Ths husky configuration can be found in `.huskyrc`

  Linting is run on pre-commit and lints all .js/.ts and .yaml files in the repo.
  Linting .yml uses [yamllint](https://yamllint.readthedocs.io/en/stable/) with the configuration for it being in `yamllint-cofig.yaml` which is modifying the relaxed ruleset for linting yaml.

  Additional rules for formatting yaml files are enforced in the `.editorconfig` living in the repo root. this will be used by the editor when modifying yaml files.

  Additionally to that,  there's a  **YAML Sort** VSCode plugin that has support for formatting, sorting and validating yaml which can be run manually over yaml files.

  The plugin supports quite a few commands that can be run from the vscode command palette *(Cmd+Shift+P)*.

  To reformat your yaml files according to the ruleset type in hte command palette:
  ```sh
    Format YAML
  ```

  To validate a given yaml file:
  ```sh
    Validate YAML
  ```

---
## Docs Links
...

---
## QA - Postman Collections

The application includes QA testing [collections](https://github.gamesys.co.uk/PlayerServices/core-session-service/tree/master/test/postman) .The collections has required environments(local,int03,ppc2,live) with supported endpoints. They should be import into postman app to be used.

---

## Deployment

[Deploying your service to int, pp and live](./docs/deployment.md).

---

## Sonarcube scan

[Sonarcube scan full setup](./docs/deployment.md).

---
