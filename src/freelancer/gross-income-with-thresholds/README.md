# Gross Income

The calculation is the **reverse of net income formula** with several things taken into account:

1. The boundary conditions - e.g. limit for social insurance, etc. - we do not know which of the boundaries were applied during
   the net income calculation, so we need to **iterate the formula** with each boundary condition until we get the
   correct gross income.

2. The number roundings - roundings are also irreversible so we sometimes receive **a slightly different gross income** than the original one.

## Formula

> **WARNING**: Out of date! Needs fix.

We start with the net income formula and do several equation operations to get the gross income formula.

The income formula:

> $net = gross - expenses - tax - social - health$

After the substitution:

> $net = gross - expenses - (base - nontaxable) * taxRate + credit - insuranceBase * socialRate - insuranceBase * healthRate$

And after $base$ and $insuranceBase$ substitution:

> $net = gross - expenses - ((gross - expenses) - nontaxable )* taxRate + nontaxable * taxRate - credit - (gross - expenses) * assessmentRate * socialRate - (gross - expenses) * assessmentRate * healthRate$

And after the rearrangement:

1. for flat-rate percentage expenses:

   > $$
   gross = \frac{net - taxRate * nontaxable - credit}{1 - ((1 - expensesRate) * (taxRate + assessmentRate * (socialRate + healthRate))}
   $$

2. for fixed expenses:

   > $$
   gross = \frac{net - taxRate * nontaxable - credit}{1 - (taxRate + assessmentRate * (socialRate + healthRate))} + expenses
   $$

You see that the formula looks quite complex.

## Simplification

We can simplify the formula by introducing the combined rates:

> $$ratesCombined = taxRate + assessmentRate * (socialRate + healthRate)$$

And then the formula becomes:

1. for flat-rate percentage expenses:

   > $$
   gross = \frac{net - taxRate * nontaxable - credit} {1 - (1 - expensesRate) * ratesCombined}
   $$

2. for fixed expenses:

   > $$
   gross = \frac{net - taxRate * nontaxable - credit}{1 - ratesCombined} + expenses
   $$

## Dealing with boundary conditions

By boundary conditions, we mean:

- minimum social insurance base
- minimum health insurance bases
- zero income tax

> E.g. zero income tax can be reached with 15000 CZK profit, as well as 20000 CZK (because we subtract
> 30840 CZK credit). So we have 0 tax but do not know the original profit.

To be able to calculate the gross income, we need to iterate the formula with the boundary conditions. In each iteration:

1. verify the gross income - by calculating the net income from it and comparing it to the original net income.
2. add boundary conditions
3. calculate the gross income

We add boundary conditions one by one ordered by their threshold (in 2023, it was health, then social, then tax).
That means we use adjusted formula for each boundary condition (see it directly in the code).

We end when the net income function verifies the gross income.

## In the code

We use the top of the fraction as `top` variable and the bottom as `bottom` variable. And the `ratesCombined`
variable for the sum of the rates.

The boundary conditions are applied by boolean flags:

- `isMinHealthBaseUsed`
- `isMinSocialBaseUsed`
- `isIncomeTaxZero`
