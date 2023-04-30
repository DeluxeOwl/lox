import * as fs from "fs";
import * as readline from "readline";
import { Scanner } from "./scanner";
import { Token } from "./tokens";

class Lox {
  static hadError: boolean = false;

  static runFile(path: string) {
    fs.readFile(path, (err, data) => {
      if (err) throw err;
      const code: string = data.toString();
      Lox.run(code);
      if (Lox.hadError) process.exit(65);
    });
  }

  static runPrompt() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "> ",
    });

    rl.prompt();

    rl.on("line", (line: string) => {
      if (line === null) {
        rl.close();
        return;
      }
      Lox.run(line);
      Lox.hadError = false;
      rl.prompt();
    });
  }

  static run(source: string) {
    const scanner: Scanner = new Scanner(source);
    const tokens: Token[] = scanner.scanTokens();

    for (const token of tokens) {
      console.log(token);
    }
  }

  static error(line: number, message: string) {
    Lox.report(line, "", message);
  }

  static report(line: number, where: string, message: string) {
    console.log(`[line ${line}] Error ${where}: ${message}`);
    Lox.hadError = true;
  }
}

export { Lox };
