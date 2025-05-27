import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "uuid-generator",
  version: "1.0.0",
});

server.tool("uuid-generator", "UUID を作成する", async () => {
  return {
    content: [
      {
        type: "text",
        text: crypto.randomUUID(),
      },
    ],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.info("Server started");
}

main().catch((error) => {
  console.error("Error starting server:", error);
  process.exit(1);
});
