import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

// Determine the GraphQL endpoint based on environment
const getGraphQLEndpoint = () => {
  if (typeof window !== 'undefined') {
    // Client-side
    return process.env.NODE_ENV === 'production' 
      ? 'https://mini-pm-system.onrender.com/graphql/'
      : 'http://127.0.0.1:8000/graphql/';
  }
  // Server-side (if using SSR)
  return process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'https://mini-pm-system.onrender.com/graphql/';
};

const client = new ApolloClient({
  link: new HttpLink({
    uri: getGraphQLEndpoint(),
    headers: {
      "x-organization": "test-org",
    },
  }),
  cache: new InMemoryCache(),
});

export default client;
