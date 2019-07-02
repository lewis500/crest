using SymPy


@vars a g1 c m y0 x y xb x0
@vars h2



e1 = y0 + m*xb
e2 = a*(xb-x0)^2 + g1*xb
res = solve(e1 - e2 - h2,xb)


# x = symbols("xt, x, yt, x, a, b, c", real=true)

yt = a*xt^2 + b*xt + c
ex1 = (yt - y)/(xt - x)
ex2 = diff(yt,xt)
solve(ex1 - ex2,xt)


res = (2*a*x0 - g1 + m + sqrt(-4*a*g1*x0 - 4*a*h2 + 4*a*m*x0 + 4*a*y0 + g1^2 - 2*g1*m + m^2))/(2*a) 

x0 + (m-g1)/2a