# Business Profit Calculator

A web-based tool to calculate business expenses, break-even points, and profit margins. This calculator helps you understand your monthly financial position by accounting for static expenses, variable per-agent expenses, commission calculations, and revenue deductions.

## Features

- **Static Expenses**: Fixed monthly expenses that remain constant
- **Variable Expenses**: Expenses that vary based on the number of agents
  - Phone services (LOCAL Line, DIALER Lines)
  - Agent salaries (Overseas, TIJ, RSA agents)
- **Commission Calculation**: Automatic calculation of 15% commission on sales over $4,000 per agent (based on average)
- **Revenue Deductions**: Accounts for CLIENT Remit (37%), Merchant Reserves (5%), and Merchant Fees (3%)
- **Break-Even Analysis**: Calculates the sales amount needed to cover all expenses
- **Profit/Loss Calculation**: Shows net profit or loss after all expenses and deductions

## How to Use

1. **Enter Static Expenses**: Review and adjust the fixed monthly expenses as needed
2. **Enter Variable Expenses**: 
   - Input the number of agents using LOCAL Line and DIALER Lines
   - Input the number of each type of agent (Overseas, TIJ, RSA)
3. **Enter Revenue**: Input your total monthly sales amount
4. **Calculate**: Click the "Calculate" button to see results
5. **Review Results**: 
   - Break-Even Sales Amount: The sales needed to cover all expenses
   - Total Expenses: Sum of all expenses
   - Net Revenue: 55% of total sales (after deductions)
   - Profit/Loss: Net revenue minus total expenses

## Calculation Formulas

- **Total Static Expenses** = Sum of all static expense values
- **Total Variable Expenses** = (LOCAL Line × count) + (DIALER Lines × count) + (Agent salaries × counts)
- **Total Agents** = Sum of all agent counts
- **Agent Average Sales** = Total Monthly Sales / Total Agents
- **Commission** = If Agent Average > $4,000, then 15% × (Agent Average - $4,000) × Total Agents
- **Total Expenses** = Total Static + Total Variable + Commission
- **Net Revenue** = Total Monthly Sales × 0.55 (after 45% deductions)
- **Break-Even Sales** = Total Expenses / 0.55
- **Profit** = Net Revenue - Total Expenses

## Setup and Deployment

### Local Development

1. Clone or download this repository
2. Open `index.html` in a web browser
3. No build process or dependencies required

### Deployment to Render

1. Push this repository to GitHub
2. Log in to [Render](https://render.com)
3. Create a new "Static Site" service
4. Connect your GitHub repository
5. Configure:
   - **Build Command**: (leave empty)
   - **Publish Directory**: (leave empty or set to `/`)
6. Deploy

The site will be available at a Render-provided URL.

## File Structure

```
profit-calculator/
├── index.html      # Main HTML structure
├── styles.css      # Styling and layout
├── script.js       # Calculation logic
├── README.md       # This file
└── .gitignore      # Git ignore file
```

## Browser Support

This application uses modern web standards and works in all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is provided as-is for business use.

