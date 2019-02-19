import express from "express";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev, dir: "./src/" });
const handle = nextApp.getRequestHandler();

nextApp
  .prepare()
  .then(() => {
    const server = express();

    server.get("/p/:id", (req, res) => {
      const actualPage = "/post";
      const queryParams = { title: req.params.id };
      nextApp.render(req, res, actualPage, queryParams);
    });

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
