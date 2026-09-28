import { readFile, writeFile } from "node:fs/promises";
import { createServer } from "vite";

// Vite compiles the same React tree used by the browser. No server is deployed.
const server = await createServer({
  server: { middlewareMode: true, watch: null },
  appType: "custom",
});
try {
  const { render } = await server.ssrLoadModule("/src/how-server.tsx");
  const file = new URL("../dist/how/index.html", import.meta.url);
  const template = await readFile(file, "utf8");
  if (!template.includes("<!--guide-html-->")) throw new Error("Missing guide HTML placeholder");
  await writeFile(file, template.replace("<!--guide-html-->", render()));
  console.log("Prerendered /how from React");
} finally {
  await server.close();
}
