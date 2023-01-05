# App Schema

The app schema is a JSON file that describes the app. It is used to generate the app and to configure the app. The schema is validated against a JSON schema.

## `name`

- Type: `string`
- Required: `true`
- Default: `undefined`
- Example: `"my-app"`

The name of the app. This is used to generate the app name and the app id.

## `description`

- Type: `string`
- Required: `false`
- Default: `undefined`
- Example: `"My app"`

The description of the app. This is used to generate the app description.

## `type`

- Type: `string`
- Required: `true`
- Default: `web-app`
- Example: `"web-app"`

The type of the app. valid values are:

| Type         | Target | Output            |
| ------------ | ------ | ----------------- |
| `web-app`    | web    | Next.js           |
| `web-widget` | web    | Lit project       |
| `native-app` | mobile | React Native Expo |

## `version`

- Type: `string`
- Required: `true`
- Default: `undefined`
- Example: `"1.0.0"`

The version of the app. Using semantic versioning is recommended.

## `deps`

- Type: `object`
- Required: `false`
- Default: `undefined`
- Example: `{ "react": "16.13.1" }`

The dependencies of the app. This is used to generate the `package.json` file.

## `pages`

- Type: `array`
- Required: `true`
- Default: `undefined`
- Example: `[{ "name": "home", "path": "/", "components": [...] }]`
- minItems: `1`

The pages that will be generated. Each page is an object with the following properties:

| Property    | Type     | Required | Default | Example                                                                 |
| ----------- | -------- | -------- | ------- | ----------------------------------------------------------------------- |
| `name`      | `string` | `true`   | `undefined` | `"Home"`                                                                |
| `path`      | `string` | `true`   | `undefined` | `"/"`                                                                   |
| `components`| `array`  | `true`   | `undefined` | `[{ "name": "view", "type": "View", "props": { "title": "Home" } }]` |
| `layout`    | `string` | `false`  | `undefined` | `"default"`                                                             |


## `dataSources`

- Type: `array`
- Required: `false`
- Default: `undefined`
- Example: `[{ "name": "api", "type": "rest", "url": "https://api.example.com" }]`

The data sources that will be registered to the app.

## `theme`

- Type: `object`
- Required: `false`
- Default: `undefined`
- Example: `{ "primary": "#000000" }`

The theme of the app. This is used to generate the theme file.

## `intl`

- Type: `object`
- Required: `false`
- Default: `undefined`
- Example: `{ "locales": ["en", "id"], "defaultLocale": "en" }`

The internationalization configuration of the app.

## `config`

- Type: `object`
- Required: `false`
- Default: `undefined`
- Example: `{ "api": { "ACCESS_TOKEN": "123456" } }`

The configuration of the app.
