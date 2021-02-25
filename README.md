# desktop

[![Netlify Status](https://api.netlify.com/api/v1/badges/8dd233ec-aeab-42f6-b94c-8966c12d2ce7/deploy-status)](https://app.netlify.com/sites/actually-colab-app/deploys) ![Commit Validation](https://github.com/actually-colab/desktop/workflows/Commit%20Validation/badge.svg) ![PR Validation](https://github.com/actually-colab/desktop/workflows/PR%20Validation/badge.svg) [![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/actually-colab/desktop.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/actually-colab/desktop/context:javascript) [![Lines of Code](https://tokei.rs/b1/github/actually-colab/desktop)](https://github.com/actually-colab/desktop)

### The Kernel Gateway

This process is started by the kernel hidden renderer process and communicates with the main process via IPC.

```bash
jupyter kernelgateway --KernelGatewayApp.allow_origin="*" --KernelGatewayApp.allow_headers="content-type"
```

> Setting the CORS Access-Control-Allow-Origin to `*` is generally a bad practice for security reasons. This will allow any website or malicious agent to execute code against your machine if they know what to look for. Instead, use the following origins depending on if you are in development or production:
>
> - Development: `http://localhost:4000`
> - Production: `https://app.actuallycolab.org`

### The Editor Client

In order to setup this repo, you also must clone the [editor repo](https://github.com/actually-colab/editor) and have the following directory structure:

- root
  - desktop
  - editor

## Setup Development

1. Clone and setup the `desktop` and `editor` repo with the above directory structure
2. Start the `editor/server`
3. Install and build the `editor/client` via `yarn install && yarn build`
4. Install the `desktop` dependencies via `yarn install`

If the `editor/client` changes, you can install the latest version in the `desktop` repo by running:

```bash
yarn install:client
```

This will automatically pull the latest client (assuming proper directory structure), install and build it, remove it from `desktop` and add it back. This complicated process seems to be required from an issue where `yarn install` doesn't pick up the latest build of the local package.

## Starting Development

1. Start the website locally to sign in (see: `www` repo)
2. Start the app in the `dev` environment:

   ```bash
   yarn start
   ```

## Deploying to Production

```bash
yarn deploy
```
