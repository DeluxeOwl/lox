import {
  AssignExpr,
  BinaryExpr,
  BlockStmt,
  Expr,
  ExpressionStmt,
  GroupingExpr,
  IfStmt,
  LiteralExpr,
  PrintStmt,
  Stmt,
  UnaryExpr,
  VarStmt,
  VariableExpr,
} from "./ast";
import { Lox } from "./lox";
import { Token, TokenType } from "./tokens";

class ParseError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

// like the scanner, parser consumes flat input sequence
// we use the parser to build the AST
// we're reading tokens instead of characters
class Parser {
  private current: number = 0;
  constructor(readonly tokens: Token[]) {}

  parse(): Stmt[] {
    let statements: Array<Stmt | null> = [];
    while (!this.isAtEnd()) {
      statements.push(this.declaration());
    }

    statements = statements.filter((s) => s !== null) as Stmt[];

    return statements as Stmt[];
  }

  declaration(): Stmt | null {
    try {
      if (this.match("VAR")) return this.varDeclaration();
      return this.statement();
    } catch (error) {
      if (error instanceof ParseError) {
        this.synchronize();
        return null;
      }
    }
    return null;
  }
  varDeclaration(): Stmt {
    const name: Token = this.consume("IDENTIFIER", "Expect variable name.");

    let initializer: Expr | null = null;

    if (this.match("EQUAL")) {
      initializer = this.expression();
    }
    this.consume("SEMICOLON", "Expect ';' after variable declaration.");

    return new VarStmt(name, initializer);
  }

  private expression(): Expr {
    return this.assignment();
  }

  assignment(): Expr {
    // can be any expression of higher precedence
    const expr: Expr = this.equality();

    if (this.match("EQUAL")) {
      // check the assignment target
      // to fail on things like a + b = c;
      let equals: Token = this.previous();
      let value: Expr = this.assignment();

      if (expr instanceof VariableExpr) {
        let name: Token = expr.name;
        return new AssignExpr(name, value);
      }

      this.error(equals, "Invalid assignment target.");
    }

    return expr;
  }

  private statement(): Stmt {
    if (this.match("IF")) {
      return this.ifStatement();
    }
    if (this.match("PRINT")) {
      return this.printStatement();
    }
    if (this.match("LEFT_BRACE")) {
      return new BlockStmt(this.block());
    }
    return this.expressionStatement();
  }

  ifStatement(): Stmt {
    this.consume("LEFT_PAREN", "Expected '(' after 'if'.");
    const condition: Expr = this.expression();
    this.consume("RIGHT_BRACE", "Expected ')' after if condition.");

    const thenBranch: Stmt = this.statement();
    // optional else branch
    let elseBranch: Stmt | undefined = undefined;

    if (this.match("ELSE")) {
      elseBranch = this.statement();
    }

    return new IfStmt(condition, thenBranch, elseBranch);
  }

  block(): Stmt[] {
    let statements: Stmt[] = [];

    while (!this.check("RIGHT_BRACE") && !this.isAtEnd()) {
      statements.push(this.declaration() as Stmt);
    }

    this.consume("RIGHT_BRACE", "Expect '}' after block.");

    return statements;
  }

  expressionStatement(): Stmt {
    const expr = this.expression();
    this.consume("SEMICOLON", "Expect ';' after expression.");
    return new ExpressionStmt(expr);
  }

  printStatement(): Stmt {
    const value = this.expression();
    this.consume("SEMICOLON", "Expect ';' after value.");
    return new PrintStmt(value);
  }

  private equality(): Expr {
    let expr: Expr = this.comparison();
    while (this.match("BANG_EQUAL", "BANG")) {
      const operator = this.previous();
      const right = this.comparison();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  private comparison(): Expr {
    let expr: Expr = this.term();
    while (this.match("GREATER", "GREATER_EQUAL", "LESS", "LESS_EQUAL")) {
      const operator = this.previous();
      const right = this.term();
      expr = new BinaryExpr(expr, operator, right);
    }
    return expr;
  }

  private term(): Expr {
    let expr: Expr = this.factor();
    while (this.match("MINUS", "PLUS")) {
      const operator = this.previous();
      const right = this.factor();
      expr = new BinaryExpr(expr, operator, right);
    }
    return expr;
  }

  private factor(): Expr {
    let expr: Expr = this.unary();
    while (this.match("SLASH", "STAR")) {
      const operator = this.previous();
      const right = this.unary();
      expr = new BinaryExpr(expr, operator, right);
    }
    return expr;
  }

  private unary(): Expr {
    if (this.match("BANG", "MINUS")) {
      const operator = this.previous();
      const right = this.unary();
      return new UnaryExpr(operator, right);
    }

    return this.primary();
  }

  private primary(): Expr {
    if (this.match("FALSE")) {
      return new LiteralExpr(false);
    }
    if (this.match("TRUE")) {
      return new LiteralExpr(true);
    }
    if (this.match("NIL")) {
      return new LiteralExpr(null);
    }

    if (this.match("NUMBER", "STRING")) {
      return new LiteralExpr(this.previous().literal);
    }

    if (this.match("IDENTIFIER")) {
      return new VariableExpr(this.previous());
    }

    if (this.match("LEFT_PAREN")) {
      const expr = this.expression();
      this.consume("RIGHT_PAREN", "Expect ')' after expression.");
      return new GroupingExpr(expr);
    }

    throw this.error(this.peek(), "Expect expression.");
  }

  // discard tokens until beginning of next statement
  // most statements start with a keyword, for, if, return, var etc
  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type == "SEMICOLON") {
        return;
      }
      switch (this.peek().type) {
        case "CLASS":
        case "FUN":
        case "VAR":
        case "FOR":
        case "IF":
        case "WHILE":
        case "PRINT":
        case "RETURN":
          return;
      }

      this.advance();
    }
  }

  // checks if current token matches type and advances
  // returns an error with the token being considered and message
  private consume(type: TokenType, message: string) {
    if (this.check(type)) {
      return this.advance();
    }

    throw this.error(this.peek(), message);
  }

  private error(token: Token, message: string): ParseError {
    Lox.error(token, message);
    return new ParseError();
  }

  // matches a series of types
  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  // peeoks at the current type
  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;

    return this.peek().type === type;
  }

  // increments current
  // returns the current token (previous actually after increment)
  private advance(): Token {
    if (!this.isAtEnd()) {
      this.current++;
    }
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === "EOF";
  }

  // peeks at the current token being considered
  private peek(): Token {
    return this.tokens[this.current];
  }

  // gets the previous token
  private previous(): Token {
    return this.tokens[this.current - 1];
  }
}

export { Parser };
