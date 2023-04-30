#!/usr/bin/env tsx

import {
  AstPrinter,
  BinaryExpr,
  Expr,
  GroupingExpr,
  LiteralExpr,
  UnaryExpr,
} from "./ast";
import { Lox } from "./lox";

const args: string[] = process.argv.splice(2);

// let expression: Expr = new BinaryExpr(
//   new UnaryExpr(
//     { type: "MINUS", lexeme: "-", literal: null, line: 1 },
//     new LiteralExpr(123)
//   ),
//   { type: "STAR", lexeme: "*", literal: null, line: 1 },
//   new GroupingExpr(new LiteralExpr(45.67))
// );

// console.log(new AstPrinter().print(expression));

if (args.length > 1) {
  console.log("Usage: ./index.ts [script]");
} else if (args.length === 1) {
  Lox.runFile(args[0]);
} else {
  Lox.runPrompt();
}
