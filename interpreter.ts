import {
  BinaryExpr,
  Expr,
  ExprVisitor,
  ExpressionStmt,
  GroupingExpr,
  LiteralExpr,
  PrintStmt,
  Stmt,
  StmtVisitor,
  UnaryExpr,
  VarStmt,
  VariableExpr,
} from "./ast";
import { Token } from "./tokens";
import { Lox } from "./lox";
import { Environment } from "./environment";

class RuntimeError extends Error {
  constructor(readonly token: Token, readonly message: string) {
    super(message);
  }
}

class Interpreter implements ExprVisitor<any>, StmtVisitor<void> {
  private environment = new Environment();

  visitVariableExpr(expr: VariableExpr) {
    return this.environment.get(expr.name);
  }

  visitVarStmt(stmt: VarStmt): void {
    let value = null;

    if (stmt.initializer !== null) {
      value = this.evalute(stmt.initializer);
    }

    this.environment.define(stmt.name.lexeme, value);
  }

  visitExpressionStmt(stmt: ExpressionStmt): void {
    this.evalute(stmt.expr);
  }

  visitPrintStmt(stmt: PrintStmt): void {
    const value = this.evalute(stmt.expr);
    console.log(this.stringify(value));
  }

  visitBinaryExpr(expr: BinaryExpr) {
    const left: any = this.evalute(expr.left);
    const right: any = this.evalute(expr.right);

    switch (expr.operator.type) {
      case "GREATER":
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) > Number(right);
      case "GREATER_EQUAL":
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) >= Number(right);
      case "LESS":
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) < Number(right);
      case "LESS_EQUAL":
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) <= Number(right);
      case "MINUS":
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) - Number(right);
      case "PLUS":
        if (typeof left === "number" && typeof right === "number") {
          return left + right;
        }
        if (typeof left === "string" && typeof right === "string") {
          return left + right;
        }
        throw new RuntimeError(
          expr.operator,
          "Operands must be two numbers or two strings."
        );
      case "SLASH":
        this.checkNumberOperands(expr.operator, left, right);
        if (Number(right) === 0) {
          throw new RuntimeError(expr.operator, "Division by zero.");
        }
        return Number(left) / Number(right);
      case "STAR":
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) * Number(right);
      case "BANG_EQUAL":
        return !this.isEqual(left, right);
      case "EQUAL_EQUAL":
        return this.isEqual(left, right);
    }
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
        this.checkNumberOperand(expr.operator, right);
        return -Number(right);
      case "BANG":
        return !this.isTruthy(right);
    }
  }
  checkNumberOperand(operator: Token, operand: any) {
    if (typeof operand === "number") {
      return;
    }
    throw new RuntimeError(operator, "Operand must be a number.");
  }
  checkNumberOperands(operator: Token, left: any, right: any) {
    if (typeof left === "number" && typeof right === "number") {
      return;
    }
    throw new RuntimeError(operator, "Operands must be numbers.");
  }
  isEqual(a: any, b: any): boolean {
    // language specific

    // if (a === null && b === null) return true;
    // if (a === null) {
    //   return false;
    // }
    return a === b;
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

  stringify(object: any): string {
    if (object === null) {
      return "nil";
    }

    if (typeof object === "number") {
      let text = object.toString();
      if (text.endsWith(".0")) {
        text = text.substring(0, text.length - 2);
      }
      return text;
    }

    return object.toString();
  }

  interpret(statements: Stmt[]) {
    try {
      for (const statement of statements) {
        this.execute(statement);
      }
    } catch (e) {
      if (e instanceof RuntimeError) {
        Lox.runtimeError(e);
      } else {
        console.error("Unkown error", e);
      }
    }
  }

  execute(statement: Stmt) {
    statement.accept(this);
  }
}

export { Interpreter, RuntimeError };
