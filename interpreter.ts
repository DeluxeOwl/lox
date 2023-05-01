import {
  BinaryExpr,
  Expr,
  ExprVisitor,
  GroupingExpr,
  LiteralExpr,
  UnaryExpr,
} from "./ast";

class Interpreter implements ExprVisitor<any> {
  visitBinaryExpr(expr: BinaryExpr) {
    const left: any = this.evalute(expr.left);
    const right: any = this.evalute(expr.right);

    switch (expr.operator.type) {
      case GREATER:
        return Number(left) > Number(right);
      case "GREATER_EQUAL":
        return Number(left) >= Number(right);
      case "LESS":
        return Number(left) < Number(right);
      case "LESS_EQUAL":
        return Number(left) <= Number(right);
      case "MINUS":
        return Number(left) - Number(right);
      case "PLUS":
        if (typeof left === "number" && typeof right === "number") {
          return left + right;
        }
        if (typeof left === "string" && typeof right === "string") {
          return left + right;
        }
      case "SLASH":
        return Number(left) / Number(right);
      case "STAR":
        return Number(left) * Number(right);

      case "BANG_EQUAL":
        return !this.isEqual(left, right);
      case "EQUAL_EQUAL":
        return this.isEqual(left, right);
    }
  }
  isEqual(a: any, b: any): boolean {
    // language specific

    // if (a === null && b === null) return true;
    // if (a === null) {
    //   return false;
    // }
    return a === b;
  }

  visitGroupingExpr(expr: GroupingExpr) {
    return this.evalute(expr.expression);
  }
  visitLiteralExpr(expr: LiteralExpr) {
    return expr.value;
  }
  visitUnaryExpr(expr: UnaryExpr) {
    const right: any = this.evalute(expr.right);

    switch (expr.operator.type) {
      case "MINUS":
        return -Number(right);
      case "BANG":
        return !this.isTruthy(right);
    }
  }

  isTruthy(object: any) {
    if (object === null) {
      return false;
    }
    if (typeof object === "boolean") return Boolean(object);
    return true;
  }

  evalute(expr: Expr): any {
    return expr.accept(this);
  }
}

export { Interpreter };
