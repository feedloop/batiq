# :screwdriver: creato

Creato is application generator and runtime for web and mobile application.

## TODO

- [ ] App schema
- [ ] Runtime
  - [ ] Navigator
  - [ ] State management
  - [ ] Data Source management
  - [ ] Action runtime
- [ ] Generator
  - [ ] Next.js
  - [ ] Web Components
  - [ ] React Native
- [ ] Component SDK
- [ ] Action SDK

## Getting Started

### Run application in browser

Use `@creato/cli` to run application from a browser.

```bash
npx @creato/cli run ./app.json
```

It will run the application under `http://localhost:3000`.

For react-native application, it will use [react-native-web](https://necolas.github.io/react-native-web) to render components.

### Mount application dynamically

```ts
// run-app.ts
import { run } from "@creato/runtime";
const appSchema = {
  type: "web-app",
  name: "My App",
  pages: [
    {
      name: "Home",
      path: "/",
      content: [
        {
          type: "h1",
          props: {
            style: {
              color: "red",
            },
          },
          children: [
            {
              type: "Button",
              props: {
                onClick: "@navigate /about",
              },
              children: "Click me",
            },
          ],
        },
      ],
    },
  ],
};

run(appSchema, {
  root: "#app",
});
```

### Generate project code from schema

Use `@creato/cli` to generate application from schema.

```bash
npx @creato/cli generate ./app.json
```

It will generate the application under `./output` directory.

Use the generator dynamically.

```ts
// generate-app.ts
import { generate } from "@creato/generator";
import appSchema from "./app.json";

generate(appSchema, {
  output: "./output",
});
```

The target project will be determined by the `type` property in the schema.

| Type         | Target | Output       |
| ------------ | ------ | ------------ |
| `web-app`    | web    | Next.js      |
| `web-widget` | web    | Lit project  |
| `native-app` | mobile | React Native |

## App schema

The app schema is a JSON file that describes the application. It is used by the generator to create the application. An application schema can be created under `app.json` or `app.yaml` file. The `type` property is required to determine the target of the application. you can use `web-app` for web application, `web-widget` for web widget, and `native-app` for native application.

### Example

```json
// app.json
{
  "type": "web-app",
  "name": "My App",
  "description": "My app description",
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
          "children": [
            {
              "type": "Button",
              "props": {
                "onClick": "@navigate /about"
              },
              "children": "Click me"
            }
          ]
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
  ]
}
```

It's also can be written in yaml format.

```yaml
# app.yaml
name: My App
type: web-app
description: My app description
pages:
  - name: Home
    path: /
    content:
      - type: h1
        props:
          style:
            color: red
        children:
          - type: Button
            props:
              onClick: "@navigate /about"
            children: Click me
  - name: About
    path: /about
    content:
      - type: h1
        children: This is the about page
```

## Runtime

The runtime is a library that is used to run the application. It is used by the generator to create the application. It can be installed under `@creato/runtime`.

### Navigator

The navigator is a library that is used to navigate between pages. It can be imported from a component under `@creato/runtime`.

```tsx
import { navigator } from "@creato/runtime";

const MyComponent = () => {
  return <button onClick={() => navigator.navigate("/about")}>Click me</button>;
};
```

### State management

The state management is a library that is used to manage the state of the application. It can be imported from a component under `@creato/runtime`.

```tsx
import { state } from "@creato/runtime";

const MyComponent = () => {
  const count = state.useState((state) => state.count);

  return (
    <button onClick={() => state.setState({ count: count + 1 })}>
      Click me
    </button>
  );
};
```

### Data Source management

The data source management is a library that is used to manage the data source of the application. It can be imported from a component under `@creato/runtime`.

```tsx
import { dataSource } from "@creato/runtime";

const MyComponent = () => {
  const { data } = dataSource.useDataSource((dataSource) => dataSource.data);

  return (
    <button onClick={() => dataSource.setDataSource({ data: data + 1 })}>
      Click me
    </button>
  );
};
```

### Action runtime

The action runtime is a library that is used to run the action of the application. It can be imported from a component under `@creato/runtime`.

```tsx
import { action } from "@creato/runtime";

const MyComponent = () => {
  return (
    <button onClick={() => action.runAction("my-action")}>Click me</button>
  );
};
```

## Generator

The generator is a library that is used to generate the application. We can generate an application source code from the app schema. while generating the application, the `type` property from application schema will be used to determine the target.

```ts
import { generate } from "@creato/generator";
import appSchema from "./app.json";

generate(appSchema, {
  output: "./output",
});
```
