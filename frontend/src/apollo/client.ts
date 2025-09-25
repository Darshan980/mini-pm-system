import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

// Use environment variable or fallback to production URL
const graphqlEndpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT || "https://mini-pm-system.onrender.com/graphql/";

const client = new ApolloClient({
  link: new HttpLink({
    uri: graphqlEndpoint,
    headers: {
      "x-organization": "test-org",
    },
  }),
  cache: new InMemoryCache(),
});

export default client;
