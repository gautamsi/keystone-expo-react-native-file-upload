# Keystone 6 upload example


## How to use

### Setup Keystone

- Clone keystone repo somewhere
- run `yarn` in the repo
- Just run the demo in `example-staging/basic`

### Running the app

- Run `yarn` or `npm install`
- Change url of keystone graphql api, do not use localhost as you may be running in emulator or phone. change `uri: `http://localhost:3000/api/graphql`, to `uri: `http://yourserver-name-or-ip:3000/api/graphql`,
- Run [`expo start`](https://docs.expo.dev/versions/latest/workflow/expo-cli/), try it out.

> every time you run, this will create a new random user with image you selected in avatar field and same file in attachment field