# desktop

![Commit Validation](https://github.com/actually-colab/desktop/workflows/Commit%20Validation/badge.svg) ![PR Validation](https://github.com/actually-colab/desktop/workflows/PR%20Validation/badge.svg) [![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/actually-colab/desktop.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/actually-colab/desktop/context:javascript) [![Lines of Code](https://tokei.rs/b1/github/actually-colab/desktop)](https://github.com/actually-colab/desktop)

### The Kernel Gateway

This process is started by the kernel hidden renderer process and communicates with the main process via IPC.

```bash
jupyter kernelgateway --KernelGatewayApp.allow_origin="*"
```

### The Editor Client

In order to setup this repo, you also must clone the [editor repo](https://github.com/actually-colab/editor) and have the following directory structure:

- root
  - desktop
  - editor

## Setup Development

1. Clone and setup the `desktop` and `editor` repo with the above directory structure
2. Start the `editor/server`
3. Build the `editor/client` via `yarn build`
4. Install the `desktop` dependencies

## Starting Development

1. Start the website locally to sign in (see: `www` repo)
2. Start the app in the `dev` environment:

   ```bash
   yarn start
   ```

## Debugging Prod

To run the production package with devtools and a visible kernel window:

```bash
yarn cross-env DEBUG_PROD=true yarn package
```

## Packaging for Production

To package apps for the local platform:

```bash
yarn package
```

## Docs

See [docs and guides here](https://electron-react-boilerplate.js.org/docs/installation)
