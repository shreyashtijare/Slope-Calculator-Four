export default async function handler(req, res) {
  const key = process.env.DESMOS_KEY;

  res.setHeader("Content-Type", "application/javascript");
  res.send(`
    window.DESMOS_API_KEY = "${key}";
    const s = document.createElement("script");
    s.src = "https://www.desmos.com/api/v1.11/calculator.js?apiKey=${key}";
    document.head.appendChild(s);
  `);
}
