import * as fs from "fs";
import * as readline from "readline";
// import { AstPrinter } from "./ast";
import { Parser } from "./parser";
import { Scanner } from "./scanner";
import { Token } from "./tokens";
import { RuntimeError } from "./interpreter";
import { Interpreter } from "./Interpreter";

class Lox {
  static hadError: boolean = false;
  static hadRuntimeError: boolean = false;

  static runFile(path: string) {
    fs.readFile(path, (err, data) => {
      if (err) throw err;
      const code: string = data.toString();
      Lox.run(code);
      if (Lox.hadError) process.exit(65);
      if (Lox.hadRuntimeError) process.exit(70);
    });
  }

  // repl no longer works
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
    const parser: Parser = new Parser(tokens);

    const statements = parser.parse();

    if (this.hadError || statements === null) return;

    // console.log(new AstPrinter().print(expr));

    new Interpreter().interpret(statements);
  }

  static scanError(line: number, message: string) {
    Lox.report(line, "", message);
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

  static runtimeError(error: RuntimeError) {
    console.error(error.message + "\n[line " + error.token.line + "]");
    Lox.hadRuntimeError = true;
  }
}

export { Lox };
