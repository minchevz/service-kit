FROM node:14-alpine

ARG NPM_CONF_REG='registry=https://artifactory.gamesys.co.uk/artifactory/api/npm/gamesys-unicorn-npm-virtual/'
ARG NPM_CONF_AUTH_ALWAYS='always-auth=true'

ARG NEXUS
ENV NEXUS ${NEXUS}

ENV NPM_CONF_REG ${NPM_CONF_REG}
ENV NPM_CONF_AUTH_ALWAYS ${NPM_CONF_AUTH_ALWAYS}

RUN apk --no-cache add git openssh

WORKDIR /usr/src/app

## Get required dotfiles
COPY .npmrc /root/.npmrc

RUN if [ -z "$NEXUS" ]; \
    then \
        echo "Nexus Pipeline!"; \
    else \
        COPY .gitconfig /root/.gitconfig; \
        COPY .ssh /root/.ssh; \
    fi

# Setup Git
RUN  git config --global http.sslverify "false" \
&& git config --global user.email "dave.the.unicorn@gamesys.co.uk" \
&& git config --global user.name "Unicorn Automation"

# Copy source files
COPY . .

# Install, clean cache and build packages
RUN yarn

# Build
RUN yarn build
