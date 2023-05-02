import {
  BinaryExpr,
  Expr,
  ExpressionStmt,
  GroupingExpr,
  LiteralExpr,
  PrintStmt,
  Stmt,
  UnaryExpr,
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
    let statements: Stmt[] = [];
    while (!this.isAtEnd()) {
      statements.push(this.statement());
    }

    return statements;
    // try {
    //   return this.expression();
    // } catch (e) {
    //   return null;
    // }
  }

  private expression(): Expr {
    return this.equality();
  }

  private statement(): Stmt {
    if (this.match("PRINT")) {
      return this.printStatement();
    }
    return this.expressionStatement();
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

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;

    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) {
      this.current++;
    }
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === "EOF";
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }
}

export { Parser };
