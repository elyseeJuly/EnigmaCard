import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = process.cwd();
const distDir = resolve(projectRoot, "dist");
const targetDir = resolve(projectRoot, "distribution", "app");

if (!existsSync(distDir)) {
  console.error("未找到 dist/，请先执行构建。");
  process.exit(1);
}

rmSync(targetDir, { recursive: true, force: true });
mkdirSync(targetDir, { recursive: true });
cpSync(distDir, targetDir, { recursive: true });

console.log("本地网页包已生成到 distribution/app");
