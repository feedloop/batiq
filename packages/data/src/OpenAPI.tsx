import { DataSourceDefinitionSchema } from "@batiq/core";
import { Type, Static } from "@sinclair/typebox";
import OpenAPIClientAxios from "openapi-client-axios";
import { OpenAPIV3 } from "openapi-types";

const queryDefinition = Type.Required(
  Type.Object({
    operationId: Type.String(),
    parameters: Type.Optional(
      Type.Union([
        Type.Record(Type.String(), Type.Any()),
        Type.Array(
          Type.Object({
            name: Type.String(),
            value: Type.Any(),
            in: Type.Union([
              Type.Literal("query"),
              Type.Literal("header"),
              Type.Literal("path"),
              Type.Literal("cookie"),
            ]),
          })
        ),
      ])
    ),
    data: Type.Optional(Type.Any()),
  })
);

export const OpenAPIDataSource = async (data: DataSourceDefinitionSchema) => {
  const { definition, auth } = data.config;
  if (!definition) {
    throw new Error("No definition provided");
  }
  const api = new OpenAPIClientAxios({ definition });
  const client = await api.init();

  // eslint-disable-next-line prefer-const
  let { http, apiKey, oauth2, openIdConnect } = auth;

  const [securityName, securityScheme] =
    Object.entries(api.document.components?.securitySchemes || {})
      .filter(
        (entry): entry is [string, OpenAPIV3.SecuritySchemeObject] =>
          !("$ref" in entry[1])
      )
      .find(([, scheme]) =>
        Object.entries({ http, apiKey, oauth2, openIdConnect }).some(
          ([key, value]) => value && scheme.type === key
        )
      ) || [];
  const operationMap: Record<string, OpenAPIV3.OperationObject> =
    Object.fromEntries(
      Object.values(api.document.paths || {}).flatMap((path) =>
        path
          ? Object.values(path).map((operation) =>
              !Array.isArray(operation) && typeof operation === "object"
                ? operation.operationId
                  ? [operation.operationId, operation]
                  : []
                : []
            )
          : []
      )
    );

  return {
    isAuthenticated: async () => {
      switch (securityScheme?.type) {
        case "apiKey":
          return apiKey !== undefined
            ? true
            : window?.localStorage.getItem("apiKey");

        case "oauth2":
          return window?.localStorage?.getItem("token") !== null;

        case "openIdConnect":
          return window?.localStorage?.getItem("token") !== null;

        default:
          return true;
      }
    },
    authenticate: async (data) => {
      switch (securityScheme?.type) {
        case "apiKey": {
          if (apiKey) {
            apiKey = data.apiKey;
            return;
          }
          window?.localStorage.setItem("apiKey", data.apiKey);
          return;
        }

        case "oauth2": {
          const { clientId } = oauth2;
          const { scopes, authorizationUrl = oauth2.authorizationUrl } =
            securityScheme.flows.authorizationCode || {};
          const redirectUri = window.location.origin;
          const state =
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
          const url = new URL(authorizationUrl);
          url.searchParams.set("client_id", clientId);
          url.searchParams.set("redirect_uri", redirectUri);
          url.searchParams.set("response_type", "code");
          if (scopes) {
            url.searchParams.set("scope", Object.keys(scopes).join(" "));
          }
          url.searchParams.set("state", state);
          return;
        }

        case "openIdConnect": {
          // Not Implemented
          return;
        }

        default:
          return;
      }
    },
    definition: queryDefinition,
    component: async (query: Static<typeof queryDefinition>) => {
      const operation = operationMap[query.operationId];
      if (!operation) {
        throw new Error(`Operation ${query.operationId} not found`);
      }

      const res = await client[query.operationId]();
    },
  };
};
