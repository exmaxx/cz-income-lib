# Freelancer Income

Calculators:
- net income
- gross income

Including:
- tax
- social insurance
- health insurance

## Net income

Uses simple formula:

$net = gross - expenses - tax - social - health$

Where:

$tax = (base - nontaxable) * taxRate - credit$

$social = insuranceBase * socialRate$

$health = insuranceBase * healthRate$

And:

$base = gross - expenses$

$insuranceBase = base * assessmentRate$

### Expenses

The $expenses$ are either a fixed amount or a percentage of the $gross$. 

When fixed, the $expenses$ are subtracted
from the calculated result before returning it as the net income. The percentage is only used for the calculation of
the $base$ but not subtracted at the end.

### Boundary conditions

Tax: if negative, set to 0.

Social insurance base: if less than minimum social insurance base, set to minimum.

Health insurance base: if less than minimum health insurance base, set to minimum.

### Rounding

The tax and insurances are rounded up.

Insurance base is rounded down to the nearest 100.

## Gross income

The calculation is the reverse of net income with several complications:
1. The formula is not that "readable" and straightforward as the net income formula.
2. The boundary conditions make it impossible to calculate the gross income and you need to adjust the formula
to see if the boundary was applied or not.
3. The roundings are also irreversible so we aim to get close enough to the desired gross income.

## Formula

You start with the net income formula and do several equation operations to get the gross income formula.

The income formula:

$net = gross - expenses - tax - social - health$

After the substitution:

$net = gross - expenses - (base - nontaxable) * taxRate + credit - insuranceBase * socialRate - insuranceBase * healthRate$

And after $base$ and $insuranceBase$ substitution:

$net = gross - expenses - ((gross - expenses) - nontaxable )* taxRate + nontaxable * taxRate - credit - (gross - expenses) * assessmentRate * socialRate - (gross - expenses) * assessmentRate * healthRate$

And after the rearrangement:

1. for flat-rate percentage expenses:
$$
gross = \frac{net - taxRate * nontaxable - credit}{1 - ((1 - expensesRate) * (taxRate + assessmentRate * (socialRate + healthRate))}
$$

2. for fixed expenses:
$$
gross = \frac{net - taxRate * nontaxable - credit}{1 - (taxRate + assessmentRate * (socialRate + healthRate))} + expenses
$$

You see that the formula looks quite complex.

## Simplification

We can simplify the formula by introducing the combined rates:

$ratesCombined = taxRate + assessmentRate * (socialRate + healthRate)$

And then the formula becomes:

1. for flat-rate percentage expenses:
$$
gross = \frac{net - taxRate * nontaxable - credit} {1 - (1 - expensesRate) * ratesCombined}
$$

2. for fixed expenses:
$$
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
- `isMinHealthBaseForced`
- `isMinSocialBaseForced`
- `isIncomeTaxZero`
