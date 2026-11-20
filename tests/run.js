// Executa todos os testes. Uso: npm test
const fs = require("node:fs"), path = require("node:path");
const { resultados } = require("./helpers/harness");
const arquivos = fs.readdirSync(__dirname).filter((f) => f.endsWith(".test.js")).sort();
for (const f of arquivos) { const antes = resultados.ok + resultados.falhas.length; require("./" + f); console.log(f.padEnd(22), (resultados.ok + resultados.falhas.length - antes) + " testes"); }
console.log("\n" + resultados.ok + " passaram, " + resultados.falhas.length + " falharam");
if (resultados.falhas.length) { console.error("\n" + resultados.falhas.map((x) => " ✗ " + x).join("\n")); process.exit(1); }
