# desktop

![Commit Validation](https://github.com/actually-colab/desktop/workflows/Commit%20Validation/badge.svg) ![PR Validation](https://github.com/actually-colab/desktop/workflows/PR%20Validation/badge.svg) [![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/actually-colab/desktop.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/actually-colab/desktop/context:javascript) [![Lines of Code](https://tokei.rs/b1/github/actually-colab/desktop)](https://github.com/actually-colab/desktop)

## Starting Development

1. Start the kernel gateway:

   ```bash
   jupyter kernelgateway --KernelGatewayApp.allow_origin="*"
   ```

2. Start the website locally to sign in (see: `www` repo)

3. Start the app in the `dev` environment:

   ```bash
   yarn start
   ```

## Packaging for Production

To package apps for the local platform:

```bash
yarn package
```

## Docs

See [docs and guides here](https://electron-react-boilerplate.js.org/docs/installation)
