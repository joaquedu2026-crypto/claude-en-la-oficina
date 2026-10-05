#!/usr/bin/env node
import { execSync } from "node:child_process";

const MAX_ATTEMPTS = 8;
const DELAY_MS = 10000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  try {
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    break;
  } catch {
    console.error(`prisma migrate deploy falló (intento ${attempt}/${MAX_ATTEMPTS})`);
    if (attempt === MAX_ATTEMPTS) {
      console.error("Se agotaron los reintentos. Abortando el build.");
      process.exit(1);
    }
    console.error(`Reintentando en ${DELAY_MS / 1000}s...`);
    await sleep(DELAY_MS);
  }
}
