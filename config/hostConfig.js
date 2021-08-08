const configObj = {
  protocol: process.env.NODE_ENV === "production" ? "https" : "http",
  hostname: process.env.NODE_ENV === "production" ? "demogame.dev" : "localdemogame.com",
  host: process.env.NODE_ENV === "production" ? "demogame" : "localdemogame",
  portname: process.env.NODE_ENV === "production" ? "" : "3005",
  baseApiPort: process.env.NODE_ENV === "production" ? "" : ":3000",
  baseApiUrl:
    process.env.NODE_ENV === "production"
      ? `http://localhost:3000/api/`
      : "http://localhost:3000/api/",
};
module.exports = configObj;
