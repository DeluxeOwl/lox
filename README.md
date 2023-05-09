# lox

The Lox lang written in typescript from https://craftinginterpreters.com/contents.html

I'm using `tsx`:

```sh
pnpm install --global tsx
```

## Complete Grammar

```py
# match an entire program
program       => declaration* EOF ;

# a program is a series of declarations
# which are statements that bind new identifier or any other statements
declaration   => classDecl
               | funDecl
               | varDecl
               | statement ;

classDecl     => "class" IDENTIFIER ( "<" IDENTIFIER )?
                 "{" function* "}" ;
funDecl       => "fun" function ;
varDecl       => "var" IDENTIFIER ( "=" expression )? ";" ;

# statement rules produce side effects but don't introduce bindings
statement     => exprStmt
               | forStmt
               | ifStmt
               | printStmt
               | returnStmt
               | whileStmt
               | block ;

exprStmt      => expression ";" ;
forStmt       => "for" "(" ( varDecl | exprStmt | ";" )
                           expression? ";"
                           expression? ")" statement ;
ifStmt        => "if" "(" expression ")" statement
                 ( "else" statement )? ;
printStmt     => "print" expression ";" ;
returnStmt    => "return" expression? ";" ;
whileStmt     => "while" "(" expression ")" statement ;
block         => "{" declaration* "}" ;

# expressions produce values
# we use a rule for each PRECEDENCE level (low to high)
expression    => assignment ;

assignment    => ( call "." )? IDENTIFIER "=" assignment
               | logic_or ;

logic_or      => logic_and ( "or" logic_and )* ;
logic_and     => equality ( "and" equality )* ;
equality      => comparison ( ( "!=" | "==" ) comparison )* ;
comparison    => term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
term          => factor ( ( "-" | "+" ) factor )* ;
factor        => unary ( ( "/" | "*" ) unary )* ;

unary         => ( "!" | "-" ) unary | call ;
call          => primary ( "(" arguments? ")" | "." IDENTIFIER )* ;
primary       => "true" | "false" | "nil" | "this"
               | NUMBER | STRING | IDENTIFIER | "(" expression ")"
               | "super" "." IDENTIFIER ;

# utility rules to make the rules above cleaner
function      => IDENTIFIER "(" parameters? ")" block ;
parameters    => IDENTIFIER ( "," IDENTIFIER )* ;
arguments     => expression ( "," expression )* ;

# lexical grammar, to group characters into tokens
# context free so the lexical grammar is regular, no recursive rules
NUMBER        => DIGIT+ ( "." DIGIT+ )? ;
STRING        => "\"" <any char except "\"">* "\"" ;
IDENTIFIER    => ALPHA ( ALPHA | DIGIT )* ;
ALPHA         => "a" ... "z" | "A" ... "Z" | "_" ;
DIGIT         => "0" ... "9" ;
```

https://craftinginterpreters.com/classes.html#this
