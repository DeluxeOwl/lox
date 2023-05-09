import { RuntimeError } from "./interpreter";
import { Token } from "./tokens";

export class Environment {
  values: Map<string, any> = new Map<string, any>();

  // enclosing = parent environment
  constructor(readonly enclosing: Environment | null = null) {}

  // the interpreter blindly trusts that the resolver found the variable
  // deep coupling between classes
  getAt(distance: number, name: string) {
    return this.ancestor(distance).values.get(name);
  }

  ancestor(distance: number): Environment {
    let env: Environment = this;

    for (let i = 0; i < distance; i++) {
      env = env.enclosing!;
    }

    return env;
  }

  assignAt(distance: number, name: Token, value: any) {
    this.ancestor(distance).values.set(name.lexeme, value);
  }

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

    throw new RuntimeError(name, `Undefined variable ${name.lexeme}.`);
  }
}
