# ir

This library was generated with [Nx](https://nx.dev).

```mermaid
flowchart TD
    S[App Schema] -->|schema validation, scope checking, variable declaration, and optimization| IR(Batiq Intermediate Representation)
    IR --> G[Generator]
    G --> T{Target?}
    T -->|Native| T1[Expo Code]
    T -->|Web| T2[Vite App]
    T -->|Web Component| T3[Javascript file]

    IR --> R[Runtime]
```

## Building

Run `nx build ir` to build the library.

## Running unit tests

Run `nx test ir` to execute the unit tests via [Jest](https://jestjs.io).
