import { defineConfig } from "vite";
import { handleEnquiry } from "./api/enquiry.mjs";

function enquiryApi() {
  return {
    name: "navora-enquiry",
    configureServer(server) {
      server.middlewares.use("/api/enquiry", (req, res) => {
        const run = async (body) => {
          const result = await handleEnquiry(req.method || "GET", body);
          res.statusCode = result.status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(result.body));
        };
        if (req.method === "GET" || req.method === "HEAD") {
          run({}).catch(() => {
            res.statusCode = 500;
            res.end('{"ok":false}');
          });
          return;
        }
        const chunks = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          let body = {};
          if (raw) {
            try {
              body = JSON.parse(raw);
            } catch (err) {
              body = {};
            }
          }
          run(body).catch(() => {
            res.statusCode = 500;
            res.end('{"ok":false}');
          });
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [enquiryApi()],
  server: {
    host: "0.0.0.0",
    port: 8741,
    strictPort: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 8741,
    strictPort: true,
  },
});
