import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const client = new ApolloClient({
  link: new HttpLink({
    uri: "http://127.0.0.1:8000/graphql/", // Changed to localhost
    headers: {
      "x-organization": "test-org", // Match what worked in GraphQL playground
    },
  }),
  cache: new InMemoryCache(),
});

export default client;