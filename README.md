# lox

The Lox lang written in typescript from https://craftinginterpreters.com/contents.html

I'm using `tsx`:

```sh
pnpm install --global tsx
```

## Grammar

```txt
expression     ⟶ literal
               | unary
               | binary
               | grouping ;

literal        ⟶ NUMBER | STRING | "true" | "false" | "nil" ;
grouping       ⟶ "(" expression ")" ;
unary          ⟶ ( "-" | "!" ) expression ;
binary         ⟶ expression operator expression ;
operator       ⟶ "==" | "!=" | "<" | "<=" | ">" | ">="
               | "+"  | "-"  | "*" | "/" ;
```

https://craftinginterpreters.com/parsing-expressions.html

non ambiguous grammar:

```txt
expression     → equality ;
equality       → comparison ( ( "!=" | "==" ) comparison )* ;
comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
term           → factor ( ( "-" | "+" ) factor )* ;
factor         → unary ( ( "/" | "*" ) unary )* ;
unary          → ( "!" | "-" ) unary
               | primary ;
primary        → NUMBER | STRING | "true" | "false" | "nil"
               | "(" expression ")" ;
```

https://craftinginterpreters.com/control-flow.html
