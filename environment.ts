import { RuntimeError } from "./interpreter";
import { Token } from "./tokens";

export class Environment {
  private values: Map<string, any> = new Map<string, any>();

  assign(name: Token, value: any) {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }
    // assignment is not allowed to create a new variable
    // aka no implicit value decl
    throw new RuntimeError(name, `Undefined variable ${name.lexeme}.`);
  }

  define(name: string, value: any) {
    this.values.set(name, value);
  }

  get(name: Token): any {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme);
    }

    throw new RuntimeError(name, `Undefined variabled ${name.lexeme}.`);
  }
}
