import { LiteralValue, Token } from "./tokens";

export class AssignExpr {
  constructor(readonly name: Token, readonly value: Expr) {}

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitAssignExpr(this);
  }
}

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

export class VariableExpr {
  constructor(readonly name: Token) {}

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitVariableExpr(this);
  }
}

export class LogicalExpr {
  constructor(
    readonly left: Expr,
    readonly operator: Token,
    readonly right: Expr
  ) {}

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitLogicalExpr(this);
  }
}

// export class AstPrinter implements ExprVisitor<string> {
//   visitVariableExpr(expr: VariableExpr): string {
//     throw new Error("Method not implemented.");
//   }
//   visitBinaryExpr(expr: BinaryExpr): string {
//     return this.paranthethize(expr.operator.lexeme, expr.left, expr.right);
//   }
//   visitGroupingExpr(expr: GroupingExpr): string {
//     return this.paranthethize("group", expr.expression);
//   }
//   visitLiteralExpr(expr: LiteralExpr): string {
//     if (expr.value === null) {
//       return "nil";
//     }
//     return expr.value.toString();
//   }
//   visitUnaryExpr(expr: UnaryExpr): string {
//     return this.paranthethize(expr.operator.lexeme, expr.right);
//   }

//   private paranthethize(name: string, ...expr: Expr[]): string {
//     let builder = "(" + name;
//     for (const e of expr) {
//       builder += " ";
//       builder += e.accept(this);
//     }
//     builder += ")";

//     return builder;
//   }

//   print(expr: Expr): string {
//     return expr.accept(this);
//   }
// }

export interface ExprVisitor<T> {
  visitLogicalExpr(expr: LogicalExpr): T;
  visitAssignExpr(expr: AssignExpr): T;
  visitVariableExpr(expr: VariableExpr): T;
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

export class VarStmt {
  constructor(readonly name: Token, readonly initializer: Expr | null) {}

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitVarStmt(this);
  }
}

export class BlockStmt {
  constructor(readonly statements: Stmt[]) {}

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitBlockStmt(this);
  }
}

export class IfStmt {
  constructor(
    readonly condition: Expr,
    readonly thenBranch: Stmt,
    readonly elseBranch?: Stmt
  ) {}

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitIfStmt(this);
  }
}

export class WhileStmt {
  constructor(readonly condition: Expr, readonly body: Stmt) {}

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitWhileStmt(this);
  }
}

export interface StmtVisitor<T> {
  visitExpressionStmt(stmt: ExpressionStmt): T;
  visitPrintStmt(stmt: PrintStmt): T;
  visitVarStmt(stmt: VarStmt): T;
  visitBlockStmt(stmt: BlockStmt): T;
  visitIfStmt(stmt: IfStmt): T;
  visitWhileStmt(stmt: WhileStmt): T;
}

export type Expr =
  | AssignExpr
  | BinaryExpr
  | GroupingExpr
  | LiteralExpr
  | UnaryExpr
  | LogicalExpr
  | VariableExpr;

export type Stmt =
  | ExpressionStmt
  | PrintStmt
  | VarStmt
  | BlockStmt
  | IfStmt
  | WhileStmt;
