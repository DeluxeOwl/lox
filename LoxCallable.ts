import { Expr } from "./ast";
import { Interpreter } from "./interpreter";

export interface LoxCallable {
  call(interpreter: Interpreter, args: Expr[] | undefined): any;
  // the number of arguments something expects
  arity(): number;
}

// is = user defined type guard
export function isLoxCallable(obj: any): obj is LoxCallable {
  return (
    typeof obj === "object" &&
    typeof obj.call === "function" &&
    typeof obj.arity === "function"
  );
}
