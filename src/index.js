const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");

const cors = require("cors");
const compression = require("compression");

const settings = require("./../config/config.json");
const hostConfig = require("./../config/hostConfig");
const app = express();
const PROD = process.env.NODE_ENV === "production";

const port = PROD ? settings.serverPort || 3005 : process.env.PORT || 3000;

app.set("superSecret", settings.secret);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

const corsOptions = {
  origin(origin, callback) {
    callback(null, true);
  },
};
app.use(cors(corsOptions));

app.use(compression());
app.use(bodyParser.json({ limit: "100mb" }));
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "100mb",
  })
);
app.use(cookieParser());

const mongoose = require("mongoose");
const MongoConnect = require("connect-mongo");


const MongoStore = MongoConnect(session);

// mongoose.connect(settings.mongoUrl, {
//   useNewUrlParser: true,
//   useCreateIndex: true,
//   useUnifiedTopology: true,
// });

  // database connection
  mongoose.Promise = global.Promise;
  var server_connectionUrl = settings.mongoUrl+'?authSource=admin';
  var local_connectionUrl = 'mongodb://localhost/demogame_db';

    var database = (process.env.NODE_ENV == 'development') ? local_connectionUrl : server_connectionUrl;
   // var database = local_connectionUrl;
    mongoose.connect(database, {useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
     console.log("Connected to Database");
  }).catch((err) => {
      console.log(database, "Not Connected to Database ERROR! ", err);
  });


mongoose.connection.on("connected", function () {
  console.log(`/n Mongoose default connection is open to ${settings.mongoUrl} \n`
  );
});

mongoose.connection.on("error", function (err) {
  console.error("Mongoose default connection has occured " + err + " error");
});

mongoose.connection.on("disconnected", function () {
  console.log("Mongoose default connection is disconnected");
});

process.on("SIGINT", function () {
  mongoose.connection.close(function () {
    console.log("Mongoose default connection is disconnected due to application termination");
    process.exit(0);
  });
});

mongoose.set("useFindAndModify", false);

app.use(
  session({
    secret: "demo game candidate",
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
    }),
    autoRemove: "native",
    cookie: {
      secure: false,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

let server = "";
server = require("http").Server(app);

const routes = require("./routes");

app.use(
  `/api`,
  (req, res, next) => {
    console.log(" the request url is ", req.url);
    next();
  },
  routes
);

// error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: err.message,
  });
});
mongoose.set("debug", true);


const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";

io.on("connection", (socket) => {
  console.log(`Client ${socket.id} connected`);

  // Join a conversation
  const { roomId } = socket.handshake.query;
  socket.join(roomId);

  // Listen for new messages
  socket.on(NEW_CHAT_MESSAGE_EVENT, (data) => {
    io.in(roomId).emit(NEW_CHAT_MESSAGE_EVENT, data);
  });

  // Leave the room if the user closes the socket
  socket.on("disconnect", () => {
    console.log(`Client ${socket.id} diconnected`);
    socket.leave(roomId);
  });
});

server.listen(port, () => {
  if (PROD) {
    console.log(`Server started at ${hostConfig.protocol}://${hostConfig.hostname}\n`);
  } else {
    console.log(`Server started at http://localhost:3000.`);
  }
});
