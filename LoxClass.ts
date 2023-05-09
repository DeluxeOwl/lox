import { LoxCallable } from "./LoxCallable";
import { LoxInstance } from "./LoxInstance";
import { Expr } from "./ast";
import { Interpreter } from "./interpreter";

export class LoxClass implements LoxCallable {
  constructor(readonly name: string) {}

  call(interpreter: Interpreter, args: Expr[]) {
    return new LoxInstance(this);
  }

  arity(): number {
    return 0;
  }

  toString() {
    return this.name;
  }
}
