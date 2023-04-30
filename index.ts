#!/usr/bin/env tsx

import { Lox } from "./lox";

const args: string[] = process.argv.splice(2);

if (args.length > 1) {
  console.log("Usage: ./index.ts [script]");
} else if (args.length === 1) {
  Lox.runFile(args[0]);
} else {
  Lox.runPrompt();
}
