import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const client = new ApolloClient({
  link: new HttpLink({
    uri: "https://mini-pm-system.onrender.com/graphql/", // Updated to production URL
    headers: {
      "x-organization": "test-org",
    },
  }),
  cache: new InMemoryCache(),
});

export default client;
