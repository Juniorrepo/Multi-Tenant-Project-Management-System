import { ApolloServer } from '@apollo/server';
import { fastifyApolloHandler } from '@as-integrations/fastify';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';

const fastify = Fastify({ logger: true });

// Register CORS
await fastify.register(cors, {
  origin: true,
  credentials: true
});

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

// Register GraphQL handler
await fastify.register(fastifyApolloHandler(server), {
  context: async (request) => {
    // Extract organization slug from headers for multi-tenancy
    const organizationSlug = request.headers['x-organization-slug'] || 'demo-org';
    
    return {
      organizationSlug,
      request
    };
  },
  path: '/graphql'
});

// Health check endpoint
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Start the server
const start = async () => {
  try {
    const port = process.env.PORT || 4000;
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
    console.log(`📊 GraphQL Playground available in development mode`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();