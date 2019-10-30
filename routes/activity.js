"use strict";
var util = require("util");

// Deps
const Path = require("path");
const JWT = require(Path.join(__dirname, "..", "lib", "jwtDecoder.js"));
var util = require("util");
var http = require("https");
var twilio = require("twilio");

exports.logExecuteData = [];

function logData(req) {
  exports.logExecuteData.push({
    body: req.body,
    headers: req.headers,
    trailers: req.trailers,
    method: req.method,
    url: req.url,
    params: req.params,
    query: req.query,
    route: req.route,
    cookies: req.cookies,
    ip: req.ip,
    path: req.path,
    host: req.host,
    fresh: req.fresh,
    stale: req.stale,
    protocol: req.protocol,
    secure: req.secure,
    originalUrl: req.originalUrl,
  });
  console.log("body: " + util.inspect(req.body));
  console.log("headers: " + req.headers);
  console.log("trailers: " + req.trailers);
  console.log("method: " + req.method);
  console.log("url: " + req.url);
  console.log("params: " + util.inspect(req.params));
  console.log("query: " + util.inspect(req.query));
  console.log("route: " + req.route);
  console.log("cookies: " + req.cookies);
  console.log("ip: " + req.ip);
  console.log("path: " + req.path);
  console.log("host: " + req.host);
  console.log("fresh: " + req.fresh);
  console.log("stale: " + req.stale);
  console.log("protocol: " + req.protocol);
  console.log("secure: " + req.secure);
  console.log("originalUrl: " + req.originalUrl);
}

/*
 * POST Handler for / route of Activity (this is the edit route).
 */
exports.edit = function(req, res) {
  // Data from the req and put it in an array accessible to the main app.
  //console.log( req.body );
  logData(req);
  res.send(200, "Edit");
};

/*
 * POST Handler for /save/ route of Activity.
 */
exports.save = function(req, res) {
  // Data from the req and put it in an array accessible to the main app.
  //console.log( req.body );
  logData(req);
  res.send(200, "Save");
};

const formatMessage = (message, ...rest) => {
  return rest.reduce((m, r, i) => {
    const regexp = new RegExp(`\\{\\{${i}\\}\\}`, "g");
    return m.replace(regexp, r);
  }, message);
};

const getMessage = args => {
  switch (args.messageTemplate) {
    case "Code template": {
      const template = "Your {{0}} code is {{1}}";
      return formatMessage(template, "OCE", "12345678");
    }
    case "Appointment template": {
      const template = "Your appointment is coming up on {{0}} at {{1}}";
      const date = new Date();
      const millisPerDay = 1000 * 60 * 60 * 24;
      const futureDate = new Date(date.getTime() + millisPerDay * 14);
      return formatMessage(
        template,
        futureDate.toLocaleDateString(),
        futureDate.toLocaleTimeString(),
      );
    }
    case "Order template": {
      const template =
        "Your {{0}} order of {{1}} has shipped and should be delivered on {{2}}. Details: {{3}}";
      const date = new Date();
      const millisPerDay = 1000 * 60 * 60 * 24;
      const futureDate = new Date(date.getTime() + millisPerDay * 14);
      return formatMessage(
        template,
        "OCE",
        "widgets",
        futureDate.toLocaleDateString(),
        "https://iqvia.com",
      );
    }
  }
  return message;
};

const sendMessage = args => {
  const message = getMessage(args);

  const accountSid = process.env.waAccountSid;
  const authToken = process.env.waAuthToken;

  const phoneNumber = "+15703507242"; // args.phoneNumber;
  const client = twilio(accountSid, authToken);
  client.messages
    .create({
      from: "whatsapp:+14155238886",
      body: message,
      to: `whatsapp:${phoneNumber}`,
    })
    .then(waMessage => console.log(waMessage.sid));
};

/*
 * POST Handler for /execute/ route of Activity.
 */
exports.execute = function(req, res) {
  // example on how to decode JWT
  JWT(req.body, process.env.jwtSecret, (err, decoded) => {
    // verification error -> unauthorized request
    if (err) {
      console.error(err);
      return res.status(401).end();
    }

    if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
      // decoded in arguments
      var decodedArgs = decoded.inArguments[0];
      console.log("decodedArgs", decodedArgs);

      sendMessage(decodedArgs);

      logData(req);
      res.send(200, "Execute");
    } else {
      console.error("inArguments invalid.");
      return res.status(400).end();
    }
  });
};

/*
 * POST Handler for /publish/ route of Activity.
 */
exports.publish = function(req, res) {
  // Data from the req and put it in an array accessible to the main app.
  //console.log( req.body );
  logData(req);
  res.send(200, "Publish");
};

/*
 * POST Handler for /validate/ route of Activity.
 */
exports.validate = function(req, res) {
  // Data from the req and put it in an array accessible to the main app.
  //console.log( req.body );
  logData(req);
  res.send(200, "Validate");
};
