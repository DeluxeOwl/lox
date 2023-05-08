export class Return extends Error {
  constructor(readonly value: any) {
    super();
  }
}
