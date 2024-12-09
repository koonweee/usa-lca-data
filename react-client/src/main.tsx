import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import Clarity from "@microsoft/clarity";

// Initialize Clarity before rendering
try {
  const clarityProjectId = import.meta.env.VITE_CLARITY_PROJECT_ID; // Changed to use Vite env variable
  if (clarityProjectId) {
    Clarity.init(clarityProjectId);
  } else {
    console.warn('Clarity Project ID not found');
  }
} catch (error) {
  console.error('Failed to initialize Clarity:', error);
}

const client = new ApolloClient({
  uri:
    process.env.NODE_ENV === "production"
      ? "https://graphql.h1b1.work"
      : "https://graphql.h1b1.work",
  cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);
