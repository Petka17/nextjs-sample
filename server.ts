import express from "express";
import proxy from "express-http-proxy";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev, dir: "./src/" });
const handle = nextApp.getRequestHandler();

nextApp
  .prepare()
  .then(() => {
    const server = express();

    server.use(
      "/api",
      proxy("https://api.server.ru", {
        proxyReqPathResolver(req: express.Request) {
          return req.url.replace(/^\/api/, "");
        }
      })
    );

    server.get("*", (req, res) => {
      return handle(req, res);
    });

    server.listen(3000, (err: Error) => {
      if (err) throw err;
      console.log("> Ready on http://localhost:3000");
    });
  })
  .catch((err: Error) => {
    console.error(err.stack);
    process.exit(1);
  });
