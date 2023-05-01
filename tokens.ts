type SingleCharacterToken =
  | "LEFT_PAREN"
  | "RIGHT_PAREN"
  | "LEFT_BRACE"
  | "RIGHT_BRACE"
  | "COMMA"
  | "DOT"
  | "MINUS"
  | "PLUS"
  | "SEMICOLON"
  | "SLASH"
  | "STAR";

type TwoCharacterToken =
  | "BANG"
  | "BANG_EQUAL"
  | "EQUAL"
  | "EQUAL_EQUAL"
  | "GREATER"
  | "GREATER_EQUAL"
  | "LESS"
  | "LESS_EQUAL";

type LiteralToken = "IDENTIFIER" | "STRING" | "NUMBER";

type KeywordToken =
  | "AND"
  | "CLASS"
  | "ELSE"
  | "FALSE"
  | "FOR"
  | "FUN"
  | "IF"
  | "NIL"
  | "OR"
  | "PRINT"
  | "RETURN"
  | "SUPER"
  | "THIS"
  | "TRUE"
  | "VAR"
  | "WHILE"
  | "EOF";

const keywordTokenMap: { [key: string]: KeywordToken } = {
  and: "AND",
  class: "CLASS",
  else: "ELSE",
  false: "FALSE",
  for: "FOR",
  fun: "FUN",
  if: "IF",
  nil: "NIL",
  or: "OR",
  print: "PRINT",
  return: "RETURN",
  super: "SUPER",
  this: "THIS",
  true: "TRUE",
  var: "VAR",
  while: "WHILE",
  eof: "EOF",
};

type TokenType =
  | SingleCharacterToken
  | TwoCharacterToken
  | KeywordToken
  | LiteralToken;

type LiteralValue = string | number | boolean | null;

type Token = {
  type: TokenType;
  lexeme: string;
  literal: LiteralValue;
  line: number;
};

export {
  keywordTokenMap,
  LiteralValue,
  Token,
  TokenType,
  SingleCharacterToken,
  TwoCharacterToken,
  KeywordToken,
  LiteralToken,
};
