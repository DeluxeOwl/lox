export class LoxClass {
  constructor(private readonly name: string) {}

  toString() {
    return this.name;
  }
}
