import { LoxCallable } from "./LoxCallable";
import { Expr } from "./ast";
import { Interpreter } from "./interpreter";

export class LoxFunction implements LoxCallable {
  call(interpreter: Interpreter, args: Expr[]) {
    throw new Error("Method not implemented.");
  }
  arity(): number {
    throw new Error("Method not implemented.");
  }
}
