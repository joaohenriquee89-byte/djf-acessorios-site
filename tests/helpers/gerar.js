// Ponte CommonJS -> script ESM do gerador de catálogo (síncrona).
const { execFileSync } = require("node:child_process"), path = require("node:path");
exports.gerar = () => execFileSync(process.execPath, ["--input-type=module", "-e", `import {gerar} from ${JSON.stringify("file://" + path.join(__dirname, "../../scripts/build-catalog.mjs"))};process.stdout.write(gerar())`], { encoding: "utf8", maxBuffer: 1e8 });
