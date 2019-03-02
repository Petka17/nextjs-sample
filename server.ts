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

    // server.use("/api/login/request_code", (_, req) => {
    //   req.status(500);
    //   req.statusMessage = "Error inside";
    //   req.end();
    // });

    // server.use("/api/login/request_code", (_, req) => {
    //   req.status(200);
    //   req.json({
    //     success: true,
    //     data: {
    //       expires_in: 300,
    //       external_id: "sdgdsgsd",
    //       timeout_expiration_block: 60
    //     }
    //   });
    // });

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
