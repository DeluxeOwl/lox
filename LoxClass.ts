import { LoxCallable } from "./LoxCallable";
import { LoxFunction } from "./LoxFunction";
import { LoxInstance } from "./LoxInstance";
import { Expr } from "./ast";
import { Interpreter } from "./interpreter";

export class LoxClass implements LoxCallable {
  constructor(
    readonly name: string,
    readonly methods: Map<string, LoxFunction>
  ) {}

  findMethod(name: string): LoxFunction | null {
    if (this.methods.has(name)) {
      return this.methods.get(name)!;
    }
    return null;
  }

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
