import { LoxCallable } from "./LoxCallable";
import { Return } from "./Return";
import { Expr, FunStmt } from "./ast";
import { Environment } from "./environment";
import { Interpreter } from "./interpreter";

export class LoxFunction implements LoxCallable {
  constructor(readonly declaration: FunStmt) {}

  call(interpreter: Interpreter, args: Expr[]) {
    // each function gets its own environment
    // with its parameters
    const env = new Environment(interpreter.globals);
    for (let i = 0; i < this.declaration.params.length; i++) {
      env.define(this.declaration.params[i].lexeme, args[i]);
    }

    try {
      interpreter.executeBlock(this.declaration.body, env);
    } catch (returnValue: unknown) {
      if (returnValue instanceof Return) {
        return returnValue.value;
      }
    }
  }

  arity(): number {
    return this.declaration.params.length;
  }

  toString(): string {
    return `<fn ${this.declaration.name.lexeme}>`;
  }
}
