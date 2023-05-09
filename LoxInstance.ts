import { LoxClass } from "./LoxClass";
import { RuntimeError } from "./interpreter";
import { Token } from "./tokens";

export class LoxInstance {
  private readonly fields: Map<string, any> = new Map<string, any>();

  constructor(readonly klass: LoxClass) {}

  set(name: Token, value: any) {
    this.fields.set(name.lexeme, value);
  }

  get(name: Token): any {
    if (this.fields.has(name.lexeme)) {
      return this.fields.get(name.lexeme);
    }

    throw new RuntimeError(name, `Undefined property '${name.lexeme}'.`);
  }

  toString() {
    return this.klass.name + " instance";
  }
}
