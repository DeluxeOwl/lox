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
