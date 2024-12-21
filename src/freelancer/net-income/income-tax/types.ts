export interface NetIncomeTaxBaseResults {
  incomeTaxBase: number
  profit: number
  taxableProfit: number
}

export interface NetIncomeTaxResults {
  highRateTaxBase: number
  lowRateTaxBase: number
  incomeTax: number
  lowRateIncomeTax: number
  highRateIncomeTax: number
}
