FROM dockerhub-proxy.artifactory.gamesys.co.uk/node:18-alpine

# Install Git
RUN apk add --no-cache git

# Set Git user
RUN git config --global http.sslverify "false" \
    && git config --global user.email "dave.the.unicorn@gamesys.co.uk" \
    && git config --global user.name "Unicorn Automation"

# To Copy npmrc to docker below steps are been performed

# Copy source files
COPY . .

COPY npmfile/.npmrc /root/

WORKDIR /usr/src/app

# Copy source files
COPY . .

#  Install Dependencies
RUN yarn add @typescript-eslint/eslint-plugin --dev --ignore-workspace-root-check


# Install, clean cache and build packages
RUN yarn

# Command to run the application
CMD ["yarn", "lerna", "lintify"]
