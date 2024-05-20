# Contributing guidelines

## Inner Source model

This service uses an Inner Source model.

Inner Source is the use of open source software development best practices and the establishment of an open source-like culture within organizations. The organization may still develop proprietary software, but internally opens up its development. - [Wikipedia: Inner source](https://en.wikipedia.org/wiki/Inner_source)

## Ways of working

There is a Confluence page that details the ways of working for this service.

[Confluence page: Web UI Platform - Ways of Working](https://confluence.gamesys.co.uk/x/KAfkBw)

## Pipelines

The current pipelines are delivered on [GoCD](https://gocd.psunicorncd.pgt.gaia/go/tab/pipeline/history/scs-build) as it is the only option available.

PRs are checked (unit tests and integration tests for now) with a Jenkins pipeline defined in the Jenkinsfile at the root.

## Scope

A pull request should have a single specific purpose.
It's preferred to open multiple small pull requests rather than one large one.

## Code quality

Having a codebase that is stable, maintainable and reliable is a high priority requirement.

Bypassing the linters, the tests or any other automation tool that is put in place to ensure quality isn't allowed,
irrespective of deadlines or other "reasons".
If there is a problem, please ask a question or raise an issue.
You can also open a pull request to fix that issue separately.

We follow [Clean Code (adapted for TypeScript)](https://github.com/labs42io/clean-code-typescript). You may also have a look at [Clean Code (adapted for JavaScript)](https://github.com/ryanmcdermott/clean-code-javascript).

Commits follow practices of [commitizen-cli](https://github.com/commitizen/cz-cli) and [conventional commits](https://conventionalcommits.org).

## Approvals

It is recommended to request a review from someone who is familiar with the code in question.

We require two approvals for any pull request to progress further.
At least one of these must come from a core maintainer.

In addition, the PR must go through QA (see below QA testing for details). In particular, a thumbs up needs to be acquired before merging a PR.

## Testing

### Unit tests

Any pull request must include sufficient unit tests to reach the minimum coverage levels required.

### Integration tests

Any pull request must include sufficient integration (functional) tests to reach the minimum coverage levels required.

### QA testing

Once two approvals are received, someone needs to test the pull request.
Postman collections must be updated if applicable (e.g. new endpoint, change of parameters, ...).

Testing can be done by any developer or QA engineer, provided they have sufficient knowledge of the service.
Testing comments are to be added as pull request comments.
Testing pass is signified as a thumbs up emoji.

Please also mention where QA was carried on (environment env-X? POC space? somewhere else?).

## Merging & Responsibility

After testing pass, and fixing any residual conflicts, the original author is asked to merge their pull request in.
We use ["Squash and Merge"](https://help.github.com/en/articles/about-pull-request-merges#squash-and-merge-your-pull-request-commits).

If the merge causes the pipeline to break, it is the the author's responsibility to fix the issue without delay (to avoid blocking the pipeline).

In the unlikely event of this contributing guide being ignored (i.e. approval process being skipped, broken pipelines),
the core maintainers will revert the commit to ensure quality and delivery pipeline stability.
