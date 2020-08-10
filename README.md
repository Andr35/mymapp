# MyMapp

![Badge](https://github.com/Andr35/mymapp/workflows/CI/badge.svg)

A simple application to record travels, trips, and other activities with
attached photos into a geojson file.

The application can run as an electron application or as a web application.

The project is based on the following technologies:

- [Angular](https://angular.io/)
- [Ionic](https://ionicframework.com/)
- [Capacitor](https://capacitorjs.com/)

## Build

First, run:

```bash
npm run install
```

The project can be built using two different commands:

```bash
# Only build the project
npm run build:prod
# Build the project and synchronize the files in the capacitor platforms
npm run cap:sync:prod
```

To build an package the electron application, run the following commands (after
the project build):

```bash
cd electron
npm run electron:build-linux # To create a deb installer
npm run electron:build-mac # To create a dmg file
npm run electron:build-windows # To create an exe installer
```

## Development

First, you need to create an environment file in folder `envrionments` called
`envrionment.ts`. Copy the content of `envrionments\environment.sample.ts` in
the new file and replace the Mapbox token with a valid one. Here is described
how to get one [Mapbox Access
Tokens](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/).

```bash
# e.g. Mapbox token is "abc123"

# Copy configurations
cp environments/environment.sample.ts environments/environment.ts
# Setup the token
sed -i 's/PASTE-HERE-A-MAPBOX-TOKEN/abc123/g' environments/environment.ts
```

Use the following command to serve locally the application and watch for file
changes:

```bash
npm install
npm run start -- --open
```

Use the following command to test the election application, after having built
the project:

```bash
cd electron
npm run electron:start
```
