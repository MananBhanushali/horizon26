import random
from typing import List, Dict

def run_backtest(portfolio: Dict[str, float], historical_years: int) -> Dict[str, any]:
    """
    Dummy backtesting function for the hackathon.
    """
    annual_returns = []
    current_value = sum(portfolio.values())
    
    for _ in range(historical_years):
        # Generate a random return between -10% and +20%
        yearly_return = random.uniform(-0.10, 0.20)
        annual_returns.append(yearly_return)
        current_value *= (1 + yearly_return)
        
    return {
        "final_value": current_value,
        "cagr": (current_value / sum(portfolio.values())) ** (1/historical_years) - 1,
        "max_drawdown": min(annual_returns),
        "annual_returns": annual_returns
    }

if __name__ == "__main__":
    test_portfolio = {"Equity": 100000, "Debt": 50000}
    print(run_backtest(test_portfolio, 10))
