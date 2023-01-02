# creato

`creato` is application generator for creato application schema.

## Todo

- [ ] App schema
- [ ] Core
  - [ ] App navigation for web and native
  - [ ] App state management
  - [ ] Remote data management
  - [ ] Action runtime
- [ ] Generator
  - [ ] Next.js
  - [ ] Web Components
  - [ ] React Native
- [ ] Component SDK
- [ ] Action SDK

## App schema

The app schema is a JSON file that describes the application. It is used by the generator to create the application. It's also can be written in yaml format.

### Example

```json
{
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

```yaml
name: My App
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
              onClick: '@navigate /about'
            children: Click me
  - name: About
    path: /about
    content:
      - type: h1
        children: This is the about page
```
