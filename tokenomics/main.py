import random
import pandas as pd
import numpy as np
from config import params
from utils import final_active_bots
from simulation import run_simulation, display_summary, display_ap_statistics
from visualization import create_visualizations

# Set random seed for reproducibility
random.seed(1)

def main(parameters=None):
    """
    Main entry point for the Neobots tokenomics simulation.
    
    Args:
        parameters: Simulation parameters (optional, uses default if None)
    """
    if parameters is None:
        parameters = params
        
    print("Starting Neobots tokenomics simulation...")
    
    # Run the simulation
    simulation_results, final_token_supply = run_simulation(parameters)
    
    # Calculate AP type statistics
    ap_stats = {}
    # Calculate total points for each AP type
    for ap_type in parameters.AP_TYPES.keys():
        self_points = simulation_results[f"{ap_type}_Self_Points"].sum()
        giving_points = simulation_results[f"{ap_type}_Giving_Points"].sum()
        total_points = self_points + giving_points
        ap_stats[ap_type] = {
            'self_points': self_points,
            'giving_points': giving_points,
            'total_points': total_points
        }
    
    # Display summary statistics
    display_summary(simulation_results, final_token_supply, parameters)
    
    # Display AP type statistics
    display_ap_statistics(ap_stats, final_active_bots, parameters)
    
    # Save the results as a CSV file
    simulation_results.to_csv('neobots_simulation_with_multi_ap.csv', index=False)
    print("\nFull results have been saved to: neobots_simulation_with_multi_ap.csv")
    
    # Create visualizations
    try:
        create_visualizations(simulation_results, final_token_supply, ap_stats, parameters)
    except Exception as e:
        print(f"Error creating visualizations: {e}")
        print("Visualization skipped. Make sure matplotlib is installed.")

if __name__ == "__main__":
    main()
