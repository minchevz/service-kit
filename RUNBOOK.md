# Service-Kit

is a Reusable micro-service tools with everything you need to spin up and configure a micro-service.

## Code

service-kit

## Primary URL

- [@service-kit/server](https://artifactory.gamesys.co.uk/ui/packages/npm:%2F%2F@service-kit%2Fserver?name=%40service-kit&type=packages)
- [@service-kit/redis](https://artifactory.gamesys.co.uk/ui/packages/npm:%2F%2F@service-kit%2Fredis?name=%40service-kit&type=packages)
- [@service-kit/logger](https://artifactory.gamesys.co.uk/ui/packages/npm:%2F%2F@service-kit%2Flogger?name=%40service-kit&type=packages)
- [@service-kit/generator](https://artifactory.gamesys.co.uk/ui/packages/npm:%2F%2F@service-kit%2Fgenerator?name=%40service-kit&type=packages)
- [@service-kit/core](https://artifactory.gamesys.co.uk/ui/packages/npm:%2F%2F@service-kit%2Fcore?name=%40service-kit&type=packages)
- [@service-kit/config-loader](https://artifactory.gamesys.co.uk/ui/packages/npm:%2F%2F@service-kit%2Fconfig-loader?name=%40service-kit&type=packages)
- [@service-kit/common](https://artifactory.gamesys.co.uk/ui/packages/npm:%2F%2F@service-kit%2Fcommon?name=%40service-kit&type=packages)
- [@service-kit/cacher](https://artifactory.gamesys.co.uk/ui/packages/npm:%2F%2F@service-kit%2Fcacher?name=%40service-kit&type=packages)


## Service Tier

A group within the Operations team, working 24/7 to support 230 platinum systems at the FT, performing monitoring and basic support tasks for all of them

## Lifecycle Stage

Production

## Delivered By

unicorn/pegacorn

## Supported By

unicorn

## Known About By

- steven.dawe
- oktay.osmanov
- villy.lyubenova
- giuseppe.ruggieri

## Host Platform

Internal / Kubernetes

## Architecture
This system is a Koa/Typescript framework,Node.js

- [The Library ADR 1](https://confluence.gamesys.co.uk/display/UP/The+Library)
- [The Library INFO](https://confluence.gamesys.co.uk/display/UP/The+Framework)
- [Load Testing Strategies](https://confluence.gamesys.co.uk/pages/viewpage.action?spaceKey=UP&title=%5BSpike%5D+GTECH-70901+-+Performance+and+load+testing+strategy)

## Contains Personal Data

No

## Contains Sensitive Data

No

## Dependencies

## Pipelines

- [Jenkins](https://jenkins.psunicorn.pgt.gaia/blue/organizations/jenkins/service-kit/activity)
- [GoCD](https://gocd.psunicorncd.pgt.gaia/go/pipelines#!/service-kit)

## Load Testing

Yes

## Test Coverage

100%

## Release Process Type

FullyAutomated

## Rollback Process Type

PartiallyAutomated

## Failover Details

Our Fastly config automatically routes requests between the production EU and US Heroku applications. If one of those regions is down, Fastly will route all requests to the other region.

## Release Details
The application is deployed to testing/staging environments whenever a new PR is created to QA and QA must :cake: as a comment.
The application is deployed to QA whenever a new commit is pushed to the master branch of this repo on GitHub. To release to production, the QA application must be manually promoted through the INT03 and PPC2.

- [GoCD Pipeline](https://gocd.psunicorncd.pgt.gaia/go/pipelines?viewName=ServiceKit#!/)
- [Jenkins Pipeline](https://jenkins.psunicorn.pgt.gaia/blue/organizations/jenkins/service-kit/activity)

## Monitoring

## First Line Troubleshooting

Health checks and dynatrace cpu & memory usage .

## Second Line Troubleshooting

If the application is failing entirely, you'll need to check a couple of things:

1.  Did a deployment just happen? If so, roll it back to bring the service back up (hopefully)
2.  Check the Dynatrace metrics, to see what CPU and memory usage is like.
3.  Check the Splunk logs (see the monitoring section of this runbook for the link)

If only a few things aren't working, the Splunk logs (see monitoring) are the best place to start debugging. Always roll back a deploy if one happened just before the thing stopped working – this gives you the chance to debug in the relative calm of QA or local.
