# core-session-service

Test Session Service
[Github Repo](https://github.gamesys.co.uk/client-delivery-platform/core-session-service)

## Code

core-session-service

## Primary URL

- [INT03](http://core-session-service.int03.integration.pgt.gaia)
- [INT08](http://core-session-service.int08.integration.pgt.gaia)
- [INT10](http://core-session-service.int10.integration.pgt.gaia)
- [PPC1](http://core-session-service.stg.pp1.pgt.gaia)
- [PPC2](http://core-session-service.stg.pp2.pgt.gaia)
- [PP21](http://core-session-service.stg.pp21.pgt.gaia)
- [PP22](http://core-session-service.stg.pp22.pgt.gaia)
- [LIVE EU](http://core-session-service.prod.l1.inx.gaia)
- [LIVE NJ](http://core-session-service.prod.l1.trop.gaia)
- [LIVE AZ](http://core-session-service.prod.l1.usaz1.gaia)
- [LIVE NY](http://core-session-service.prod.l1.usny1.gaia)

## Service Tier

A group within the Operations team, working 24/7 to support 230 platinum systems at the FT, performing monitoring and basic support tasks for all of them

## Lifecycle Stage

Production

## Delivered By

Unicorn

## Supported By

Unicorn/Pegacorn

## Known About By

- Oktay Osmanov
- Steven Dawe

## Host Platform

Internal / Kubernetes

## Architecture
This system is a Koa/Typescript framework,Node.js [application](https://github.gamesys.co.uk/PlayerServices/core-session-service) and [library](https://github.gamesys.co.uk/PlayerServices/service-kit).

Please refer to documentation/architecture.md

## Contains Personal Data

No

## Contains Sensitive Data

No

## Dependencies

- site-content-service

## Test Coverage

http://sonarqube.gamesysgames.com/api/project_badges/measure?project=core-session-service&metric=coverage

## Release Process Type
FullyAutomated

## Rollback Process Type
PartiallyAutomated

## Failover Details

Our Fastly config automatically routes requests between the production EU and US Heroku applications. If one of those regions is down, Fastly will route all requests to the other region.

## Release Details
The application is deployed to testing/staging environments whenever a new PR is created to QA and QA must :cake: as a comment.
The application is deployed to QA whenever a new commit is pushed to the master branch of this repo on GitHub. To release to production, the QA application must be manually promoted through the INT03 and PPC2.

[GoCD Pipeline](https://gocd.psunicorncd.pgt.gaia/go/pipelines?viewName=gm2#!/)
[Jenkins Pipeline](https://jenkins.psunicorn.pgt.gaia/blue/organizations/jenkins/core-session-service/activity)

## Monitoring

- [Int03 Logs](https://splunk.int03.integration.pgt.gaia/en-US/app/search/search?q=search%20index%3Dunicorn%20core-session-service%20sourcetype%3D%22k8s.int03%22&display.page.search.mode=smart&dispatch.sample_ratio=1&workload_pool=&earliest=-60m%40m&latest=now&display.prefs.events.count=10&sid=1649275031.1406481)
- [Int08 Logs](https://splunk.int08.integration.pgt.gaia/en-US/app/search/search?q=search%20index%3Dunicorn%20core-session-service%20sourcetype%3D%22k8s.int08%22&display.page.search.mode=smart&dispatch.sample_ratio=1&workload_pool=&earliest=-60m%40m&latest=now&display.prefs.events.count=10&sid=1649275128.1639380)
- [PPC2 Logs](https://srch00.pgt01.gamesys.corp:8000/en-US/app/search/search?q=search%20index%3Dunicorn%20core-session-service%20sourcetype%3D%22k8s.ppc2%22&display.page.search.mode=fast&dispatch.sample_ratio=1&earliest=-60m%40m&latest=now&display.page.search.tab=events&sid=1649275151.161412_DAABCFC5-A58D-46D6-B3DD-6AEEB0A65477)
- [PP21 Logs](https://srch00.pgt01.gamesys.corp:8000/en-US/app/search/search?q=search%20index%3Dunicorn%20core-session-service%20sourcetype%3D%22k8s.pp21%22&display.page.search.mode=fast&dispatch.sample_ratio=1&earliest=-60m%40m&latest=now&display.page.search.tab=events&sid=1649275162.161413_DAABCFC5-A58D-46D6-B3DD-6AEEB0A65477)
- [PP22 Logs](https://srch00.pgt01.gamesys.corp:8000/en-US/app/search/search?q=search%20index%3Dunicorn%20core-session-service%20sourcetype%3D%22k8s.pp22%22&display.page.search.mode=fast&dispatch.sample_ratio=1&earliest=-60m%40m&latest=now&display.page.search.tab=events&sid=1649275175.161414_DAABCFC5-A58D-46D6-B3DD-6AEEB0A65477)
- [Live EU Logs](https://srch00.inx01.gamesys.corp:8000/en-US/app/search/search?q=search%20index%3Dunicorn%20front-end-auth-service%20sourcetype%3D%22k8s.live_eu%22&display.page.search.mode=smart&dispatch.sample_ratio=1&earliest=-24h%40h&latest=now&sid=1649274870.506698_EC3FD98E-924A-4A40-A267-CB995CC0AC51)
- [Live NJ Logs](https://splunk.prod.root.trop.gaia/en-GB/app/search/search?q=search%20index%3Dunicorn%20core-session-servicee%20sourcetype%3D%22k8s.live_nj%22&display.page.search.mode=smart&dispatch.sample_ratio=1&earliest=-15m&latest=now&display.general.type=events&sid=1651593913.914659)
- [Live AZ Logs](https://splunk.prod.root.usaz1.gaia/en-GB/app/search/search?q=search%20index%3Dunicorn%20core-session-service%20sourcetype%3D%22k8s.live_nj%22&display.page.search.mode=smart&dispatch.sample_ratio=1&earliest=-24h%40h&latest=now&sid=1651593955.328301)
- [Live NY Logs](https://splunk.prod.root.usny1.gaia/en-GB/app/search/search?q=search%20index%3Dunicorn%20core-session-service%20sourcetype%3D%22k8s.live_nj%22&display.page.search.mode=smart&dispatch.sample_ratio=1&earliest=-24h%40h&latest=now&sid=1651593997.5102)

- [Int03 Dynatrace](https://hdz48658.live.dynatrace.com/#newservices)
- [Ppc2 Dynatrace](https://apg81144.live.dynatrace.com/#newservices)
- [Live Dynatrace](https://qvn05441.live.dynatrace.com)

## First Line Troubleshooting

Health checks and dynatrace cpu & memory usage .

## Second Line Troubleshooting

If the application is failing entirely, you'll need to check a couple of things:

1.  Did a deployment just happen? If so, roll it back to bring the service back up (hopefully)
2.  Check the Dynatrace metrics, to see what CPU and memory usage is like.
3.  Check the Splunk logs (see the monitoring section of this runbook for the link)

If only a few things aren't working, the Splunk logs (see monitoring) are the best place to start debugging. Always roll back a deploy if one happened just before the thing stopped working – this gives you the chance to debug in the relative calm of QA or local.
