import {
  AssignExpr,
  BinaryExpr,
  BlockStmt,
  CallExpr,
  Expr,
  ExprVisitor,
  ExpressionStmt,
  FunStmt,
  GroupingExpr,
  IfStmt,
  LiteralExpr,
  LogicalExpr,
  PrintStmt,
  ReturnStmt,
  Stmt,
  StmtVisitor,
  UnaryExpr,
  VarStmt,
  VariableExpr,
  WhileStmt,
} from "./ast";
import { Environment } from "./environment";
import { Lox } from "./lox";
import { Token } from "./tokens";
import { LoxCallable, isLoxCallable } from "./LoxCallable";
import { LoxFunction } from "./LoxFunction";

class RuntimeError extends Error {
  constructor(readonly token: Token, readonly message: string) {
    super(message);
  }
}

class Interpreter implements ExprVisitor<any>, StmtVisitor<void> {
  // clock native function in js: https://craftinginterpreters.com/functions.html#native-functions
  // compared to "foreign functions", depends on the perspective

  // fixed reference to outmost global environment
  readonly globals = new Environment();

  // tracks the current environment
  private environment = this.globals;

  // we stuff the native function in that global scope
  constructor() {
    this.globals.define("clock", {
      arity(): number {
        return 0;
      },
      call(interpreter: Interpreter, args: Expr[]): number {
        return new Date().getTime() / 1000;
      },
      toString() {
        return "<native fn>";
      },
    } as LoxCallable);
  }

  // STATEMENTS
  visitReturnStmt(stmt: ReturnStmt): void {
    throw new Error("Method not implemented.");
  }

  visitFunStmt(stmt: FunStmt): void {
    const func = new LoxFunction(stmt);
    this.environment.define(stmt.name.lexeme, func);
  }

  visitWhileStmt(stmt: WhileStmt): void {
    while (this.isTruthy(this.evalute(stmt.condition))) {
      this.execute(stmt.body);
    }
  }

  visitIfStmt(stmt: IfStmt): void {
    if (this.isTruthy(this.evalute(stmt.condition))) {
      this.execute(stmt.thenBranch);
    } else if (stmt.elseBranch) {
      this.execute(stmt.elseBranch);
    }
  }

  visitBlockStmt(stmt: BlockStmt): void {
    this.executeBlock(stmt.statements, new Environment(this.environment));
  }

  visitAssignExpr(expr: AssignExpr): any {
    const value: any = this.evalute(expr.value);
    this.environment.assign(expr.name, value);
    return value;
  }

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

  // EXPRESSIONS

  visitCallExpr(expr: CallExpr) {
    const callee = this.evalute(expr.callee);

    let args: Expr[] = [];
    if (expr.args) {
      args = [];
      for (const arg of expr.args) {
        args.push(this.evalute(arg));
      }
    }

    // if it doesn't implement the interface
    if (!isLoxCallable(callee)) {
      throw new RuntimeError(
        expr.paren,
        "Can only call functions and classes."
      );
    }

    const func: LoxCallable = callee as LoxCallable;
    if (args.length !== func.arity()) {
      throw new RuntimeError(
        expr.paren,
        `Expected ${func.arity()} arguments but got ${args.length}.`
      );
    }
    return func.call(this, args);
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

  visitLogicalExpr(expr: LogicalExpr) {
    const left = this.evalute(expr.left);

    // short circuit
    if (expr.operator.type === "OR") {
      if (this.isTruthy(left)) {
        return left;
      }
    } else {
      if (!this.isTruthy(left)) {
        return left;
      }
    }

    return this.evalute(expr.right);
  }

  // IMPLEMENTATION FUNCTIONS
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

  executeBlock(statements: Stmt[], environment: Environment) {
    // save the old environment and restore it
    const previous = this.environment;
    try {
      this.environment = environment;
      for (const statement of statements) {
        this.execute(statement);
      }
    } finally {
      this.environment = previous;
    }
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
