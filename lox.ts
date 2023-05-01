import * as fs from "fs";
import * as readline from "readline";
import { Scanner } from "./scanner";
import { Token } from "./tokens";
import { Parser } from "./parser";
import { AstPrinter, Expr } from "./ast";
import exp from "constants";

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
    console.log(tokens);
    const parser: Parser = new Parser(tokens);

    const expr = parser.parse();

    if (this.hadError || expr === null) return;

    console.log(new AstPrinter().print(expr));
  }

  static error(token: Token, message: string) {
    if (token.type === "EOF") {
      Lox.report(token.line, " at end", message);
    } else {
      Lox.report(token.line, " at '" + token.lexeme + "'", message);
    }
  }

  static report(line: number, where: string, message: string) {
    console.log(`[line ${line}] Error ${where}: ${message}`);
    Lox.hadError = true;
  }
}

export { Lox };
