export default function handler(req, res) {
  const key = process.env.DESMOS_KEY;

  res.setHeader("Content-Type", "application/javascript");
  res.status(200).send(`
    (function() {
      var s = document.createElement("script");
      s.src = "https://www.desmos.com/api/v1.11/calculator.js?apiKey=${key}";
      s.async = true;
      document.head.appendChild(s);
    })();
  `);
}
