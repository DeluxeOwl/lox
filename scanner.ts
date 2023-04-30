import { Token, TokenType, keywordTokenMap } from "./tokens";
import { Lox } from "./lox";

class Scanner {
  private readonly source: string;
  private readonly tokens: Token[] = [];

  // The start and current fields are offsets that index into the string. The start field points to the first character in the lexeme being scanned, and current points at the character currently being considered.
  private start = 0;
  private current = 0;
  private line = 1;

  constructor(source: string) {
    this.source = source;
  }

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push({
      type: "EOF",
      lexeme: "",
      literal: null,
      line: this.line,
    });

    return this.tokens;
  }

  isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  scanToken(): void {
    let c: string = this.advance();

    switch (c) {
      case "(":
        this.addToken("LEFT_PAREN");
        break;
      case ")":
        this.addToken("RIGHT_PAREN");
        break;
      case "{":
        this.addToken("LEFT_BRACE");
        break;
      case "}":
        this.addToken("RIGHT_BRACE");
        break;
      case ",":
        this.addToken("COMMA");
        break;
      case ".":
        this.addToken("DOT");
        break;
      case "-":
        this.addToken("MINUS");
        break;
      case "+":
        this.addToken("PLUS");
        break;
      case ";":
        this.addToken("SEMICOLON");
        break;
      case "*":
        this.addToken("STAR");
        break;
      // handling 2 character lexemes
      case "!":
        this.addToken(this.match("=") ? "BANG_EQUAL" : "BANG");
        break;
      case "=":
        this.addToken(this.match("=") ? "EQUAL_EQUAL" : "EQUAL");
        break;
      case "<":
        this.addToken(this.match("=") ? "LESS_EQUAL" : "LESS");
        break;
      case ">":
        this.addToken(this.match("=") ? "GREATER_EQUAL" : "GREATER");
        break;
      case "/":
        if (this.match("/")) {
          // comment goes until the end of the line
          while (this.peek() !== "\n" && !this.isAtEnd()) {
            this.advance();
          }
        } else {
          this.addToken("SLASH");
        }
        break;
      case " " || "\r" || "\t":
        break;
      case "\n":
        this.line++;
        break;
      case '"':
        this.string();
        break;
      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          // we keep scanning to catch more errors
          // coalescing a run of invalid characters into a single error would
          // give a nicer user experience
          Lox.error(this.line, `Unexpected character: ${c}`);
        }
        break;
    }
  }

  advance(): string {
    return this.source[this.current++];
  }

  addToken(type: TokenType, literal?: any) {
    const literalToAdd = typeof literal !== "undefined" ? literal : null;

    const text: string = this.source.substring(this.start, this.current);

    this.tokens.push({
      type: type,
      lexeme: text,
      literal: literalToAdd,
      line: this.line,
    });
  }

  match(expected: string): boolean {
    if (this.isAtEnd()) {
      return false;
    }

    if (this.source[this.current] !== expected) {
      return false;
    }

    this.current++;

    return true;
  }

  // lookahead
  // like advance but doesn't consume character
  peek(): string {
    if (this.isAtEnd()) {
      return "\0";
    }

    return this.source[this.current];
  }

  string(): void {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() == "\n") {
        // lox allows multi line strings
        this.line++;
      }
      this.advance();
    }

    if (this.isAtEnd()) {
      Lox.error(this.line, "Unterminated string.");
      return;
    }

    // the closing "
    this.advance();

    // trim surrounding quotes
    const value: string = this.source.substring(
      this.start + 1,
      this.current - 1
    );

    this.addToken("STRING", value);
  }

  isDigit(c: string): boolean {
    return c >= "0" && c <= "9";
  }

  number() {
    while (this.isDigit(this.peek())) {
      this.advance();
    }

    // fractional part
    if (this.peek() == "." && this.isDigit(this.peekNext())) {
      this.advance();

      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    this.addToken(
      "NUMBER",
      parseFloat(this.source.substring(this.start, this.current))
    );
  }

  peekNext(): string {
    if (this.current + 1 >= this.source.length) return "\0";
    return this.source[this.current + 1];
  }

  identifier() {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }

    const text = this.source.substring(this.start, this.current);
    let tokType: TokenType | undefined = keywordTokenMap[text];

    if (typeof tokType === "undefined") {
      tokType = "IDENTIFIER";
    }

    this.addToken(tokType);
  }

  isAlpha(c: string): boolean {
    return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c == "_";
  }

  isAlphaNumeric(c: string): boolean {
    return this.isDigit(c) || this.isAlpha(c);
  }
}

export { Scanner };
