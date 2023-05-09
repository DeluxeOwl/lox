import { isatty } from "tty";
import {
  AssignExpr,
  BinaryExpr,
  BlockStmt,
  CallExpr,
  ClassStmt,
  Expr,
  ExpressionStmt,
  FunStmt,
  GroupingExpr,
  IfStmt,
  LiteralExpr,
  LogicalExpr,
  PrintStmt,
  ReturnStmt,
  Stmt,
  UnaryExpr,
  VarStmt,
  VariableExpr,
  WhileStmt,
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
      if (this.match("CLASS")) {
        return this.classDeclaration();
      }
      if (this.match("FUN")) return this.function("function");
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

  classDeclaration(): Stmt {
    const name = this.consume("IDENTIFIER", "Expect class name.");
    this.consume("LEFT_BRACE", "Expect '{' before class body");

    const methods: Stmt[] = [];
    while (!this.check("RIGHT_BRACE") && !this.isAtEnd()) {
      methods.push(this.function("method"));
    }

    this.consume("RIGHT_BRACE", "Expect '}' after class body.");

    return new ClassStmt(name, methods);
  }

  // kind, method or function
  function(kind: string): Stmt {
    const name: Token = this.consume("IDENTIFIER", `Expect ${kind} name.`);
    this.consume("LEFT_PAREN", `Expect '(' after ${kind} name.`);

    let parameters: Token[] = [];

    if (!this.check("RIGHT_PAREN")) {
      do {
        if (parameters.length >= 255) {
          this.error(this.peek(), "Can't have more than 255 parameters.");
        }
        parameters.push(this.consume("IDENTIFIER", "Expect parameter name."));
      } while (this.match("COMMA"));
    }
    this.consume("RIGHT_PAREN", "Expect ')' after parameters.");

    // block assumes '{' has been matched
    // this gives us more context => hey, we're in a function
    this.consume("LEFT_BRACE", `Expect '{' before ${kind} body.`);
    const body: Stmt[] = this.block();

    return new FunStmt(name, parameters, body);
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
    const expr: Expr = this.or();

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

  or(): Expr {
    let expr = this.and();

    while (this.match("OR")) {
      const operator: Token = this.previous();
      const right: Expr = this.and();

      expr = new LogicalExpr(expr, operator, right);
    }

    return expr;
  }

  and(): Expr {
    let expr = this.equality();
    while (this.match("AND")) {
      const operator: Token = this.previous();
      const right: Expr = this.and();

      expr = new LogicalExpr(expr, operator, right);
    }

    return expr;
  }

  private statement(): Stmt {
    if (this.match("FOR")) {
      return this.forStatement();
    }

    if (this.match("IF")) {
      return this.ifStatement();
    }

    if (this.match("PRINT")) {
      return this.printStatement();
    }

    if (this.match("RETURN")) {
      return this.returnStatement();
    }

    if (this.match("WHILE")) {
      return this.whileStatement();
    }
    if (this.match("LEFT_BRACE")) {
      return new BlockStmt(this.block());
    }
    return this.expressionStatement();
  }

  returnStatement(): Stmt {
    const keyword: Token = this.previous();
    let value: Expr | null = null;

    if (!this.check("SEMICOLON")) {
      value = this.expression();
    }

    this.consume("SEMICOLON", "Expect ';' after return value.");
    return new ReturnStmt(keyword, value);
  }

  forStatement(): Stmt {
    this.consume("LEFT_PAREN", "Expect '(' after 'for'.");

    let initializer: Stmt | undefined;
    // check for different cases
    if (this.match("SEMICOLON")) {
      initializer = undefined;
    } else if (this.match("VAR")) {
      initializer = this.varDeclaration();
    } else {
      initializer = this.expressionStatement();
    }

    let condition: Expr | undefined;
    if (!this.check("SEMICOLON")) {
      condition = this.expression();
    }
    this.consume("SEMICOLON", "Expect ';' after loop condition.");

    let increment: Expr | undefined;
    if (!this.check("RIGHT_PAREN")) {
      increment = this.expression();
    }
    this.consume("RIGHT_PAREN", "Expect ')' after for clauses.");

    let body: Stmt = this.statement();

    // desugaring into a while loop
    if (typeof increment !== "undefined") {
      body = new BlockStmt([body, new ExpressionStmt(increment)]);
    }

    if (!condition) {
      condition = new LiteralExpr(true);
    }
    body = new WhileStmt(condition, body);

    // runs once before the entire loop
    if (typeof initializer !== "undefined") {
      body = new BlockStmt([initializer, body]);
    }

    return body;
  }

  whileStatement(): Stmt {
    this.consume("LEFT_PAREN", "Expected '(' after while.");
    const condition = this.expression();
    this.consume("RIGHT_PAREN", "Expected ')' after condition.");
    const body = this.statement();

    return new WhileStmt(condition, body);
  }

  ifStatement(): Stmt {
    this.consume("LEFT_PAREN", "Expected '(' after 'if'.");
    const condition: Expr = this.expression();

    this.consume("RIGHT_PAREN", "Expected ')' after if condition.");

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

    return this.call();
  }

  private call(): Expr {
    let expr: Expr = this.primary();

    // will expand later to match properties on objects
    while (true) {
      // we parse a primary expression
      if (this.match("LEFT_PAREN")) {
        // we use finishCall to finish parsing the expression and return it
        expr = this.finishCall(expr);
      } else {
        break;
      }
    }

    return expr;
  }

  finishCall(callee: Expr): Expr {
    let args: Expr[] = [];

    if (!this.check("RIGHT_PAREN")) {
      do {
        // simplify bytecode later, limit nr of arguments
        // parser keeps going after this
        if (args.length >= 255) {
          this.error(this.peek(), "Can't have more than 255 arguments.");
        }
        args.push(this.expression());
      } while (this.match("COMMA"));
    }

    const paren = this.consume("RIGHT_PAREN", "Expect ')' after arguments.");

    return new CallExpr(callee, paren, args);
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

  // peeks at the current type
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
