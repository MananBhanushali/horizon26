from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from optimization_engine import optimize_portfolio
from risk_controls import run_monte_carlo

app = FastAPI(title="Portfolio Optimization & Risk Controls API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Portfolio Optimization & Risk Controls API is running"}

@app.get("/optimize")
def get_optimized_portfolio(age: int = 30, risk_tolerance: str = "moderate"):
    # Returns an optimized portfolio based on age and risk profile for Indian markets
    allocation = optimize_portfolio(age, risk_tolerance)
    return {"status": "success", "allocation": allocation}

@app.get("/simulate")
def simulate_market_shock(portfolio_value: float = 10000000.0, shock_scenario: str = "2008_crash"):
    # Runs Monte Carlo simulation
    results = run_monte_carlo(portfolio_value, shock_scenario)
    return {"status": "success", "simulation_results": results}
