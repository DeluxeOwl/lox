import { LiteralValue, Token } from "./tokens";

// this was from chapter 2, an alternative
// to the visitor pattern

type Expr = BinaryExpr | GroupingExpr | LiteralExpr | UnaryExpr;

type BinaryExpr = {
  kind: "binary";
  left: Expr;
  operator: Token;
  right: Expr;
};

type GroupingExpr = {
  kind: "grouping";
  expression: Expr;
};

type LiteralExpr = {
  kind: "literal";
  value: LiteralValue;
};

type UnaryExpr = {
  kind: "unary";
  operator: Token;
  right: Expr;
};

class AstPrinter {
  private paranthethize(expr: Expr): string {
    switch (expr.kind) {
      case "binary":
        return `(${expr.operator.lexeme} ${this.paranthethize(
          expr.left
        )} ${this.paranthethize(expr.right)})`;
      case "grouping":
        return `(group ${this.paranthethize(expr.expression)})`;
      case "literal":
        return expr.value === null ? "nil" : expr.value.toString();
      case "unary":
        return `(${expr.operator.lexeme} ${this.paranthethize(expr.right)})`;

      default:
        throw new Error("Expression kind not found.");
    }
  }

  print(expr: Expr): string {
    return this.paranthethize(expr);
  }
}

let expression: Expr = {
  kind: "binary",
  left: {
    kind: "unary",
    operator: { type: "MINUS", lexeme: "-", literal: null, line: 1 },
    right: { kind: "literal", value: 123 },
  },
  operator: { type: "STAR", lexeme: "*", literal: null, line: 1 },
  right: { kind: "grouping", expression: { kind: "literal", value: 45.67 } },
};

console.log(new AstPrinter().print(expression));
