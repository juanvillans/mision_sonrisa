import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
import express from "express";
import { ARCJET_KEY } from "../config/env.js";

const app = express();
const port = 3000;

const aj = arcjet({
 
  key: ARCJET_KEY,
  characteristics: ["ip.src"], // Track requests by IP
  rules: [

    shield({ mode: "LIVE" }),

    detectBot({
      mode: "LIVE", 
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc

      ],
    }),
    // Create a token bucket rate limit. Other algorithms are supported.
    tokenBucket({
      mode: "LIVE",
      refillRate: 10, // Refill 5 tokens per interval
      interval: 6, // Refill every 10 seconds
      capacity: 10, // Bucket capacity of 10 tokens
    }),
  ],
});

export default aj;

// app.get("/", async (req, res) => {
//   const decision = await aj.protect(req, { requested: 5 }); // Deduct 5 tokens from the bucket
//   console.log("Arcjet decision", decision);

//   if (decision.isDenied()) {
//     if (decision.reason.isRateLimit()) {
//       res.writeHead(429, { "Content-Type": "application/json" });
//       res.end(JSON.stringify({ error: "Too Many Requests" }));
//     } else if (decision.reason.isBot()) {
//       res.writeHead(403, { "Content-Type": "application/json" });
//       res.end(JSON.stringify({ error: "No bots allowed" }));
//     } else {
//       res.writeHead(403, { "Content-Type": "application/json" });
//       res.end(JSON.stringify({ error: "Forbidden" }));
//     }
//   } else if (decision.results.some(isSpoofedBot)) {
//     // Arcjet Pro plan verifies the authenticity of common bots using IP data.
//     // Verification isn't always possible, so we recommend checking the decision
//     // separately.
//     // https://docs.arcjet.com/bot-protection/reference#bot-verification
//     res.writeHead(403, { "Content-Type": "application/json" });
//     res.end(JSON.stringify({ error: "Forbidden" }));
//   } else {
//     res.writeHead(200, { "Content-Type": "application/json" });
//     res.end(JSON.stringify({ message: "Hello World" }));
//   }
// });
