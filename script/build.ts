import { es2022Lib } from "@cubing/dev-config/esbuild/es2022";
import { build } from "esbuild";
import { PrintableShellCommand } from "printable-shell-command";

await build({
  ...es2022Lib(),
  entryPoints: ["./src/index.ts"],
  outdir: "./dist/lib/plural-chain/",
});

await new PrintableShellCommand("bun", [
  "x",
  "tsc",
  ["--project", "./tsconfig.build.json"],
]).shellOut();
