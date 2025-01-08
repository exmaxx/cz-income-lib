# Net Income

Uses simple formula:

> $net = gross - expenses - tax - social - health$

Where:

> $tax = (base - nontaxable) * taxRate - credit$

> $social = insuranceBase * socialRate$

> $health = insuranceBase * healthRate$

And:

> $base = gross - expenses$

> $insuranceBase = base * assessmentRate$

## Expenses

The $expenses$ are:

- either a fixed amount
- or a percentage of the $gross$

When fixed, the $expenses$ are subtracted
from the calculated result before returning it as the net income. The percentage is only used for the calculation of
the $base$ but not subtracted at the end.

## Boundary conditions

### Tax

If negative, set to 0.

### Social insurance base

If less than minimum social insurance base, set to minimum.

### Health insurance base

If less than minimum health insurance base, set to minimum.

## Rounding

The tax and insurances are rounded up.

Insurance base is rounded down to the nearest 100.
