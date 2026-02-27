const net = require("net");
const winston = require('winston');

function createLogSender(host = "logstash", port = 5000) {
  let socket = null;
  let connected = false;
  const queue = [];

  function connect() {
    socket = new net.Socket();
    socket.connect(port, host, () => {
      connected = true;
      // send queued messages
      while (queue.length) socket.write(queue.shift() + "\n");
    });

    socket.on("error", (err) => {
      // console.error('Log sender error', err.message);
      connected = false;
      socket.destroy();
      socket = null;
      // reconnect later
      setTimeout(connect, 2000);
    });

    socket.on("close", () => {
      connected = false;
      socket = null;
      setTimeout(connect, 2000);
    });
  }

  // attempt initial connect
  setTimeout(connect, 500);

  function send(obj) {
    const line = JSON.stringify(obj);
    if (connected && socket) {
      socket.write(line + "\n");
    } else {
      // queue until connected
      queue.push(line);
    }
    // also write to stdout for docker logs
    process.stdout.write(line + "\n");
  }

  return { send };
}

function buildLogger(serviceName) {
  const logstashHost = process.env.LOGSTASH_HOST || 'logstash';
  const logstashPort = 5000;

  const socket = new net.Socket();

  // Это предотвращает падение сервиса при ошибке сети
  socket.on('error', (err) => {
    // Просто выводим в консоль, не ломая процесс
    console.log(`[Logstash Offline] ${serviceName} waits for collector...`);
  });

  socket.connect(logstashPort, logstashHost);

  return winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    defaultMeta: { service: serviceName },
    transports: [
      new winston.transports.Console(),
      new winston.transports.Stream({ stream: socket })
    ],
  });
}

module.exports = buildLogger;