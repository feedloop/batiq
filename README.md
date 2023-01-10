# :paintbrush: batiq

**Batiq** is `react` and `react-native` application generator. It generates a web page, web application, web widget, or native application.

## TODO

- [ ] App schema
- [ ] Runtime
- [ ] Core modules
  - [ ] Navigator
  - [ ] State management
  - [ ] Data Source management
  - [ ] Actions
- [ ] Generator
  - [ ] Next.js
  - [ ] Web Components
  - [ ] React Native
- [ ] Component SDK
- [ ] Action SDK

## Getting Started

### Install CLI

```bash
# npm
npm install -g @batiq/cli

# yarn
yarn global add @batiq/cli
```

It will install `@batiq/cli` globally. You can use it to create application schema, run application, and generate project code from schema.

Test the installation by running `batiq --version`.

### Create application schema

```bash
batiq init -y
```

It will create an `app.json` file under the current directory. Or you can follow the prompts to create the schema.

### Run application in the browser

Use `@batiq/cli` to run application from a browser.

```bash
batiq run ./app.json
```

It will run the application under `http://localhost:3000`. If you change the file it will dynamically refresh the app.

### Generate project code

Use the CLI to generate application from schema.

```bash
batiq generate ./app.json
```

It will generate the application under `./output` directory. The type of project will be determined by the `type` property in the schema. see all available [application types](docs/app-schema.md).

## Runtime

Runtime is a library that can be used to run an application schema inside browser. It is useful for development purpose. It can also be used to run an application schema inside a web page.

> For react-native application, it will utilize [react-native-web](https://necolas.github.io/react-native-web) to render native components inside browser.

### Install runtime

```bash
# npm
npm install @batiq/runtime

# yarn
yarn add @batiq/runtime
```

### Create and mount app

```ts
// app.ts
import { createApp } from "@batiq/runtime";
import schema from "./app.json";

const app = createApp(schema);

app.mount(document.getElementById("root"));
```

Or, you can use react `Runtime` component to mount the app.

```tsx
// app.tsx
import { Runtime } from "@batiq/runtime";
import schema from "./app.json";

const App = () => {
  return <Runtime schema={schema} />;
};
```

See all available [runtime options](docs/runtime.md).

## Generator

Generator can be used to generate project code from an app schema. It can generate Next.js, Expo, or Lit project.

```ts
// generate-app.ts
import { generate } from "@batiq/generator";
import appSchema from "./app.json";

generate(appSchema, {
  output: "./output",
});
```

## App schema

The app schema is a JSON file that describes the application. It is used by the generator to create the application. An application schema can be created under `app.json` or `app.yaml` file.

### Example

```json
{
  "type": "web-app",
  "name": "My App",
  "description": "My app description",
  "deps": {
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-router-dom": "6.0.2",
    "@batiq/components": "1.0.0",
    "@batiq/actions": "1.0.0"
  },
  "pages": [
    {
      "name": "Home",
      "path": "/",
      "content": [
        {
          "type": "h1",
          "props": {
            "style": {
              "color": "red"
            }
          },
          "children": "{{ dataSources.local.count }}"
        }
      ]
    },
    {
      "name": "About",
      "path": "/about",
      "content": [
        {
          "type": "h1",
          "children": "This is the about page"
        }
      ]
    }
  ],
  "dataSources": [
    {
      "name": "local",
      "type": "local",
      "data": {
        "count": {
          "type": "number",
          "value": 0,
          "default": 0,
          "persistent": true
        }
      }
    },
    {
      "name": "qorebase",
      "type": "api",
      "url": "https://project-01-data.qore.dev",
      "token": "{{ config.qorebase.token }}"
    }
  ],
  "config": {
    "qorebase": {
      "token": "token",
      "projectId": "project-01"
    }
  }
}
```

It's also can be written in yaml format.

```yaml
# app.yaml
type: web-app
name: My App
description: My app description
deps:
  - react@18.2.0
  - react-dom@18.2.0
  - react-router-dom@6.0.2
  - @batiq/components@1.0.0
  - @batiq/actions@1.0.0
pages:
  - name: Home
    path: /
    content:
      - type: h1
        props:
          style:
            color: red
        children: '{{ dataSources.local.count }}'
  - name: About
    path: /about
    content:
      - type: h1
        children: This is the about page
dataSources:
  - name: local
    type: local
    data:
      count:
        type: number
        value: 0
        default: 0
        persistent: true
  - name: qorebase
    type: api
    url: https://project-01-data.qore.dev
    token:  '{{ config.qorebase.token }}'
config:
  qorebase:
    token: token
    projectId: project-01
```

Read more about [app schema](docs/app-schema.md).
