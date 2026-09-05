import random
from typing import List

def generate_monte_carlo_paths(initial_value: float, expected_return: float, volatility: float, years: int, num_paths: int = 1000) -> List[List[float]]:
    """
    Generates Monte Carlo simulation paths for portfolio stress testing.
    """
    paths = []
    for _ in range(num_paths):
        path = [initial_value]
        current_val = initial_value
        for _ in range(years):
            # Simple geometric brownian motion step (mock)
            shock = random.gauss(0, 1)
            yearly_return = expected_return + (volatility * shock)
            current_val *= (1 + yearly_return)
            path.append(current_val)
        paths.append(path)
        
    return paths

def calculate_value_at_risk(paths: List[List[float]], confidence_level: float = 0.95) -> float:
    """
    Calculates VaR from simulated paths.
    """
    final_values = [path[-1] for path in paths]
    final_values.sort()
    
    index = int((1 - confidence_level) * len(final_values))
    return final_values[index]
