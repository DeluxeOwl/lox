import { RuntimeError } from "./interpreter";
import { Token } from "./tokens";

export class Environment {
  private values: Map<string, any> = new Map<string, any>();

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
