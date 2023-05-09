import {
  ExprVisitor,
  GroupingExpr,
  LiteralExpr,
  BlockStmt,
  ExpressionStmt,
  FunStmt,
  IfStmt,
  PrintStmt,
  ReturnStmt,
  VarStmt,
  WhileStmt,
  LogicalExpr,
  AssignExpr,
  VariableExpr,
  BinaryExpr,
  CallExpr,
  StmtVisitor,
  UnaryExpr,
  Stmt,
  Expr,
} from "./ast";
import { Interpreter } from "./interpreter";
import { Lox } from "./lox";
import { Token } from "./tokens";

function createStack<T>() {
  const scopes: Array<T> = [];

  const push = (elem: T) => {
    scopes.push(elem);
  };

  const pop = () => {
    scopes.pop();
  };

  const peek = () => {
    return scopes.at(-1);
  };

  const isEmpty = () => {
    return scopes.length === 0;
  };

  const size = () => {
    return scopes.length;
  };

  const get = (i: number) => {
    return scopes[i];
  };

  return { push, pop, peek, isEmpty, size, get };
}

export type FunctionType = "NONE" | "FUNCTION";

// resolve = determine its value or replace it with a corresponding value

// only e few kinds of nodes are interesting when it comes to resolving variables
// block statements, function declaration, variable decl, variable and assign expr
export class Resolver implements ExprVisitor<void>, StmtVisitor<void> {
  private currentFunction: FunctionType = "NONE";

  // This field keeps track of the stack of scopes currently, uh, in scope. Each element in the stack is a Map representing a single block scope. Keys, as in Environment, are variable names.
  constructor(
    private readonly interpreter: Interpreter,
    private readonly scopes = createStack<Map<string, boolean>>()
  ) {}

  visitExpressionStmt(stmt: ExpressionStmt): void {
    this.resolveExpr(stmt.expr);
  }

  visitPrintStmt(stmt: PrintStmt): void {
    this.resolveExpr(stmt.expr);
  }

  // resolving variable declarations
  visitVarStmt(stmt: VarStmt): void {
    this.declare(stmt.name);
    if (stmt.initializer !== null) {
      this.resolveExpr(stmt.initializer);
    }
    this.define(stmt.name);
  }

  declare(name: Token) {
    if (this.scopes.isEmpty()) {
      return;
    }

    // can't be undefined
    // non null assertion operator
    const scope: Map<string, boolean> = this.scopes.peek()!;

    if (scope.has(name.lexeme)) {
      Lox.error(name, "Already a variable with this name in this scope.");
    }

    // declaration adds the variable to the innermost scope
    // so that it shadows any outer one
    // we mark it as "not ready yet" by binding its name to false
    // it checks whether or not we have finished resolving that variable's initializer
    scope.set(name.lexeme, false);
  }

  define(name: Token) {
    if (this.scopes.isEmpty()) {
      return;
    }

    // mark it as fully initialized and available to use
    this.scopes.peek()!.set(name.lexeme, true);
  }

  // begins a new scope, traverses into the statements and discards the socpe
  visitBlockStmt(stmt: BlockStmt): void {
    this.beginScope();
    this.resolveStatements(stmt.statements);
    this.endScope();
  }

  beginScope() {
    this.scopes.push(new Map());
  }

  resolveStatements(statements: Stmt[]) {
    for (const stmt of statements) {
      this.resolveStatement(stmt);
    }
  }

  resolveStatement(stmt: Stmt) {
    stmt.accept(this);
  }

  resolveExpr(expr: Expr) {
    expr.accept(this);
  }

  endScope() {
    this.scopes.pop();
  }

  // no control flow
  visitIfStmt(stmt: IfStmt): void {
    this.resolveExpr(stmt.condition);
    this.resolveStatement(stmt.thenBranch);
    if (stmt.elseBranch) {
      this.resolveStatement(stmt.elseBranch);
    }
  }

  visitWhileStmt(stmt: WhileStmt): void {
    this.resolveExpr(stmt.condition);
    this.resolveStatement(stmt.body);
  }

  visitFunStmt(stmt: FunStmt): void {
    // we declare the name eagerly
    // this allows a function to reference itself in recursion
    this.declare(stmt.name);
    this.define(stmt.name);

    this.resolveFunction(stmt, "FUNCTION");
  }

  resolveFunction(fun: FunStmt, type: FunctionType) {
    let enclosingFunction = this.currentFunction;
    this.currentFunction = type;

    this.beginScope();
    for (const param of fun.params) {
      this.declare(param);
      this.define(param);
    }
    this.resolveStatements(fun.body);
    this.endScope();

    this.currentFunction = enclosingFunction;
  }

  visitReturnStmt(stmt: ReturnStmt): void {
    if (this.currentFunction === "NONE") {
      Lox.error(stmt.keyword, "Can't return from top level code");
    }

    if (stmt.value) {
      this.resolveExpr(stmt.value);
    }
  }

  visitLogicalExpr(expr: LogicalExpr): void {
    this.resolveExpr(expr.right);
    this.resolveExpr(expr.left);
  }

  visitAssignExpr(expr: AssignExpr): void {
    this.resolveExpr(expr.value);
    this.resolveLocal(expr, expr.name);
  }

  visitVariableExpr(expr: VariableExpr): void {
    // if it exists in the current scope but the value is false
    // it means we declared but not initalized it
    if (
      !this.scopes.isEmpty() &&
      this.scopes.peek()?.get(expr.name.lexeme) === false
    ) {
      Lox.error(expr.name, "Can't read local variable in its own initializer.");
    }

    this.resolveLocal(expr, expr.name);
  }

  // This looks, for good reason, a lot like the code in Environment for evaluating a variable.
  // We start at the innermost scope and work outwards, looking in each map for a matching name.
  // If we find the variable, we resolve it, passing in the number of scopes between the current innermost scope and the scope where the variable was found.
  // So, if the variable was found in the current scope, we pass in 0. If it’s in the immediately enclosing scope, 1. You get the idea.

  // If we walk through all of the block scopes and never find the variable, we leave it unresolved and assume it’s global.

  resolveLocal(expr: Expr, name: Token) {
    for (let i = this.scopes.size() - 1; i >= 0; i--) {
      if (this.scopes.get(i).has(name.lexeme)) {
        this.interpreter.resolve(expr, this.scopes.size() - 1 - i);
        return;
      }
    }
  }

  visitBinaryExpr(expr: BinaryExpr): void {
    this.resolveExpr(expr.left);
    this.resolveExpr(expr.right);
  }

  visitCallExpr(expr: CallExpr): void {
    this.resolveExpr(expr.callee);
    for (const arg of expr.args) {
      this.resolveExpr(arg);
    }
  }

  visitGroupingExpr(expr: GroupingExpr): void {
    this.resolveExpr(expr.expression);
  }

  // doesnt mention variables or subexpressions, no work
  visitLiteralExpr(expr: LiteralExpr): void {}

  visitUnaryExpr(expr: UnaryExpr): void {
    this.resolveExpr(expr.right);
  }
}
