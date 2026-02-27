const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const serviceName = process.env.SERVICE_NAME || "service2";

const buildLogger = require("./logger");
const logger = buildLogger(serviceName);

// В middleware логирования:
app.use((req, res, next) => {
  const requestId = req.get("X-Request-Id") || "no-id";
  
  logger.info("incoming_request", {
    request_id: requestId,
    method: req.method,
    path: req.originalUrl,
    remote_ip: req.ip
  });

  res.on("finish", () => {
    logger.info("response_sent", {
      request_id: requestId,
      status: res.statusCode
    });
  });

  next();
});

app.get("/", (req, res) => {
  res.send(`${serviceName}: root — Hello from ${serviceName}`);
});

app.get("/info", (req, res) => {
  res.json({ service: serviceName, time: new Date().toISOString() });
});

app.get("/greet/:name?", (req, res) => {
  const name = req.params.name || "Guest";
  res.send(`Hi ${name}! This is ${serviceName}.`);
});

app.listen(port, () => {
  logger.info("service_started", { port });
  console.log(`${serviceName} listening on port ${port}`);
});
