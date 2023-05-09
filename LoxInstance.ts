import { LoxClass } from "./LoxClass";
import { LoxFunction } from "./LoxFunction";
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

    const method: LoxFunction | null = this.klass.findMethod(name.lexeme);
    if (method !== null) {
      return method;
    }

    throw new RuntimeError(name, `Undefined property '${name.lexeme}'.`);
  }

  toString() {
    return this.klass.name + " instance";
  }
}
