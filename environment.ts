import { RuntimeError } from "./interpreter";
import { Token } from "./tokens";

export class Environment {
  private values: Map<string, any> = new Map<string, any>();

  // enclosing = parent environment
  constructor(readonly enclosing: Environment | null = null) {}

  assign(name: Token, value: any) {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }

    if (this.enclosing !== null) {
      this.enclosing.assign(name, value);
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

    // walk down the existing chain
    if (this.enclosing !== null) {
      return this.enclosing.get(name);
    }

    throw new RuntimeError(name, `Undefined variabled ${name.lexeme}.`);
  }
}
