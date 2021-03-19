<img src=".readme/img/header.png" width="100%">

<div align="center">

[![Netlify Status](https://api.netlify.com/api/v1/badges/8dd233ec-aeab-42f6-b94c-8966c12d2ce7/deploy-status)](https://app.netlify.com/sites/actually-colab-app/deploys) [![Validation](https://github.com/actually-colab/desktop/actions/workflows/validation.yml/badge.svg)](https://github.com/actually-colab/desktop/actions/workflows/validation.yml) [![Bundle Reporter](https://github.com/actually-colab/desktop/actions/workflows/bundle-reporter.yml/badge.svg)](https://github.com/actually-colab/desktop/actions/workflows/bundle-reporter.yml)

![GitHub](https://img.shields.io/github/license/actually-colab/desktop) [![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/actually-colab/desktop.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/actually-colab/desktop/context:javascript) ![GitHub repo size](https://img.shields.io/github/repo-size/actually-colab/desktop) [![Lines of Code](https://tokei.rs/b1/github/actually-colab/desktop)](https://github.com/actually-colab/desktop) ![GitHub issues](https://img.shields.io/github/issues/actually-colab/desktop) ![GitHub closed issues](https://img.shields.io/github/issues-closed/actually-colab/desktop)

</div>

# desktop

### The Kernel Gateway

This process is started by the kernel hidden renderer process and communicates with the main process via IPC.

```bash
jupyter kernelgateway --KernelGatewayApp.allow_origin="*" --KernelGatewayApp.allow_headers="content-type" --KernelGatewayApp.allow_methods="*"
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
yarn upgrade:client
```

This will automatically pull the latest client (assuming proper directory structure), install and build it, remove it from `desktop` and add it back. This complicated process seems to be required from an issue where `yarn install` doesn't pick up the latest build of the local package.

### Environment

You need to create a file `.env.development.local`:

```
REACT_APP_GOOGLE_CLIENT_ID="<CHANGE_ME>"
```

Optionally you can also disable auto connecting during development to avoid spam:

```
REACT_APP_KERNEL_AUTO_CONNECT="off"
```

## Starting Development

1. Start the website locally to sign in (see: `www` repo)
2. Start the app in the `dev` environment:

   ```bash
   yarn start
   ```

## Deploying to Production

Create a file `.env.production.local`:

```
REACT_APP_GOOGLE_CLIENT_ID="<CHANGE_ME>"
REACT_APP_AC_API_URI="<CHANGE_ME>"
REACT_APP_AC_WS_URI="<CHANGE_ME>"
```

```bash
yarn deploy
```
