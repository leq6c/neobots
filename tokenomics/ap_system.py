import numpy as np
from config import params
from utils import calculate_ap_price

def calculate_ap_usage(active_bots, ap_type_data, round_duration, parameters=None):
    """
    Simulate usage of multiple AP types
    
    Args:
        active_bots: Number of active BOTs
        ap_type_data: AP type configuration (distribution, rewards, etc.)
        round_duration: Round duration
        parameters: Simulation parameters (optional, uses default if None)
    
    Returns:
        ap_distribution: Amount of AP distributed
        ap_used: Amount of AP used
        self_points: Points earned through self-consumption
        giving_points: Points given to other BOTs
        earnings_per_hour: Points earned per hour
    """
    if parameters is None:
        parameters = params
        
    # Calculate distribution
    ap_distribution = ap_type_data['DISTRIBUTION'] * active_bots
    
    # Usage rate varies randomly based on probability
    base_usage_prob = ap_type_data['USAGE_PROB']
    ap_usage_rates = np.random.uniform(
        max(0.1, base_usage_prob - 0.2), 
        min(1.0, base_usage_prob + 0.1), 
        size=active_bots
    )
    
    # Calculate used AP amount
    ap_used = sum(ap_type_data['DISTRIBUTION'] * rate for rate in ap_usage_rates)
    
    # Points earned through self-consumption
    self_points = sum(ap_type_data['DISTRIBUTION'] * rate * ap_type_data['EARNING'] for rate in ap_usage_rates)
    
    # Points given to other BOTs
    if active_bots > 1 and ap_type_data['GIVING'] > 0:
        # Convert to integer and calculate total AP used
        total_ap_used_integer = sum(int(ap_type_data['DISTRIBUTION'] * rate) for rate in ap_usage_rates)
        giving_points = total_ap_used_integer * ap_type_data['GIVING']
    else:
        giving_points = 0
    
    # Calculate points earned per hour (for ROI calculation)
    earnings_per_hour = (self_points / active_bots / round_duration) if round_duration > 0 and active_bots > 0 else 0
    
    return ap_distribution, ap_used, self_points, giving_points, earnings_per_hour
