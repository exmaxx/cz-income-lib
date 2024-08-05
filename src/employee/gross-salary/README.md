# Gross Income

We reverse the net income formula in order to calculate the gross income.

We take several limits into account:
- max. social insurance base
- min. health insurance amount
- higher rate income tax
- zero income tax

## Yearly vs. monthly salary

Most calculators use the monthly salary as the input. I use the yearly so that it corresponds to freelancer
calculators.

> There might be some **slight differences in the results due to rounding**.
> 
> When you round only once (when calculating
> the yearly salary) and when you round multiple times (when calculating the monthly salary) might make
> a single-digit difference in the result.

## Formula

The net salary formula:

> $netSalary = salary - incomeTax - socialEmployeeAmount - healthEmployeeAmount$

Turns into gross salary formula:

> $$
grossSalary = \frac{netSalary - credit }{1 - taxRate - socialEmployeeRate - healthEmployeeRate}
$$

### Employer Ignored

Nota that we only need to consider the employee's contributions to the social and health insurance.

## Adjustments

We modify the formula to take into account the limits:
- max. social insurance base
- min. health insurance amount
- higher rate income tax
- zero income tax
