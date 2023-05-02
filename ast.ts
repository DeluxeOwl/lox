import { LiteralValue, Token } from "./tokens";

export class BinaryExpr {
  constructor(
    readonly left: Expr,
    readonly operator: Token,
    readonly right: Expr
  ) {}

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitBinaryExpr(this);
  }
}

export class GroupingExpr {
  constructor(readonly expression: Expr) {}

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitGroupingExpr(this);
  }
}

export class LiteralExpr {
  constructor(readonly value: LiteralValue) {}

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitLiteralExpr(this);
  }
}

export class UnaryExpr {
  constructor(readonly operator: Token, readonly right: Expr) {}

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitUnaryExpr(this);
  }
}

export class AstPrinter implements ExprVisitor<string> {
  visitBinaryExpr(expr: BinaryExpr): string {
    return this.paranthethize(expr.operator.lexeme, expr.left, expr.right);
  }
  visitGroupingExpr(expr: GroupingExpr): string {
    return this.paranthethize("group", expr.expression);
  }
  visitLiteralExpr(expr: LiteralExpr): string {
    if (expr.value === null) {
      return "nil";
    }
    return expr.value.toString();
  }
  visitUnaryExpr(expr: UnaryExpr): string {
    return this.paranthethize(expr.operator.lexeme, expr.right);
  }

  private paranthethize(name: string, ...expr: Expr[]): string {
    let builder = "(" + name;
    for (const e of expr) {
      builder += " ";
      builder += e.accept(this);
    }
    builder += ")";

    return builder;
  }

  print(expr: Expr): string {
    return expr.accept(this);
  }
}

export interface ExprVisitor<T> {
  visitBinaryExpr(expr: BinaryExpr): T;
  visitGroupingExpr(expr: GroupingExpr): T;
  visitLiteralExpr(expr: LiteralExpr): T;
  visitUnaryExpr(expr: UnaryExpr): T;
}

export class ExpressionStmt {
  constructor(readonly expr: Expr) {}

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitExpressionStmt(this);
  }
}

export class PrintStmt {
  constructor(readonly expr: Expr) {}

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitPrintStmt(this);
  }
}

export interface StmtVisitor<T> {
  visitExpressionStmt(stmt: ExpressionStmt): T;
  visitPrintStmt(stmt: PrintStmt): T;
}

export type Expr = BinaryExpr | GroupingExpr | LiteralExpr | UnaryExpr;
export type Stmt = ExpressionStmt | PrintStmt;
