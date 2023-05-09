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

export class CallExpr {
  constructor(
    readonly callee: Expr,
    // we use this token's location to report runtime errors
    // caused by a function call
    readonly paren: Token,
    readonly args: Expr[]
  ) {}

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitCallExpr(this);
  }
}

export class GetExpr {
  constructor(readonly obj: Expr, readonly name: Token) {}

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitGetExpr(this);
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

export class SetExpr {
  constructor(readonly obj: Expr, readonly name: Token, readonly value: Expr) {}

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitSetExpr(this);
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

export interface ExprVisitor<T> {
  visitGetExpr(expr: GetExpr): T;
  visitSetExpr(expr: SetExpr): T;
  visitLogicalExpr(expr: LogicalExpr): T;
  visitAssignExpr(expr: AssignExpr): T;
  visitVariableExpr(expr: VariableExpr): T;
  visitBinaryExpr(expr: BinaryExpr): T;
  visitCallExpr(expr: CallExpr): T;
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

export class FunStmt {
  constructor(
    readonly name: Token,
    readonly params: Token[],
    readonly body: Stmt[]
  ) {}

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitFunStmt(this);
  }
}
export class ReturnStmt {
  constructor(readonly keyword: Token, readonly value: Expr | null) {}

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitReturnStmt(this);
  }
}

export class ClassStmt {
  constructor(readonly name: Token, readonly methods: Stmt[]) {}

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitClassStmt(this);
  }
}

// syntactic sugar for while
// we'll desugar in the interpreter
// export class ForStmt {
//   constructor(
//     readonly initializer?: Expr,
//     readonly condition?: Expr,
//     readonly increment?: Expr
//   ) {}
// }

export interface StmtVisitor<T> {
  visitExpressionStmt(stmt: ExpressionStmt): T;
  visitPrintStmt(stmt: PrintStmt): T;
  visitVarStmt(stmt: VarStmt): T;
  visitBlockStmt(stmt: BlockStmt): T;
  visitIfStmt(stmt: IfStmt): T;
  visitWhileStmt(stmt: WhileStmt): T;
  visitFunStmt(stmt: FunStmt): T;
  visitReturnStmt(stmt: ReturnStmt): T;
  visitClassStmt(stmt: ClassStmt): T;
}

export type Expr =
  | AssignExpr
  | BinaryExpr
  | CallExpr
  | GetExpr
  | GroupingExpr
  | LiteralExpr
  | SetExpr
  | UnaryExpr
  | LogicalExpr
  | VariableExpr;

// no for statement, only syntactic sugar for while
export type Stmt =
  | ExpressionStmt
  | PrintStmt
  | ReturnStmt
  | VarStmt
  | ClassStmt
  | FunStmt
  | BlockStmt
  | IfStmt
  | WhileStmt;
