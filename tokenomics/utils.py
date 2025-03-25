import math
import random
import numpy as np
from config import params

# Global variables
final_active_bots = 0

def calculate_ap_price(ap_type_data, parameters=None):
    """
    Calculate the price of AP (in token units)
    
    Args:
        ap_type_data: AP type configuration data
        parameters: Simulation parameters (optional, uses default if None)
    """
    if parameters is None:
        parameters = params
        
    # Set price based on the higher of EARNING and GIVING
    base_price = max(ap_type_data['EARNING'], ap_type_data['GIVING'])
    return base_price * parameters.ADDITIONAL_AP_PURCHASE_PRICE_FACTOR

def calculate_nft_price(bot_count, parameters=None):
    """
    Calculate the BOT NFT price.
    
    Args:
        bot_count: Number of BOTs
        parameters: Simulation parameters (optional, uses default if None)
    """
    if parameters is None:
        parameters = params
        
    f_n = math.sqrt(bot_count / 100)
    price = parameters.BASE_PRICE * (1 + parameters.INCREASE_FACTOR * f_n)
    return price

def calculate_round_duration(bot_count, parameters=None):
    """
    Calculate the round duration (in hours) based on the number of BOTs.
    
    Args:
        bot_count: Number of BOTs
        parameters: Simulation parameters (optional, uses default if None)
    """
    # This function doesn't use any parameters from the class,
    # but keeping the parameter argument for consistency
    if parameters is None:
        parameters = params
        
    return max(0.05, 0.024 * (bot_count ** 0.6))

def simulate_bot_growth(current_bots, elapsed_hours, cumulative_hours, parameters=None):
    """
    Simulate the number of new BOTs based on a sigmoid curve.
    
    Args:
        current_bots: Current number of BOTs
        elapsed_hours: Hours elapsed since the previous round
        cumulative_hours: Total hours elapsed since the start of the simulation
        parameters: Simulation parameters (optional, uses default if None)

    Returns:
        new_bots: Number of newly added BOTs
    """
    if parameters is None:
        parameters = params
        
    if cumulative_hours > 4500 and cumulative_hours < 5500:
        # simulate zero growth in the middle of the simulation
        return 0
    # Calculate the theoretical number of BOTs at the current time using the sigmoid function (based on cumulative hours)
    target_bots_now = parameters.MAX_BOTS / (1 + math.exp(-parameters.GROWTH_STEEPNESS * (cumulative_hours - parameters.MID_POINT_HOURS) / parameters.BOT_GROWTH_TARGET_HOURS))
    
    # Theoretical number of BOTs in the previous round
    target_bots_prev = parameters.MAX_BOTS / (1 + math.exp(-parameters.GROWTH_STEEPNESS * ((cumulative_hours - elapsed_hours) - parameters.MID_POINT_HOURS) / parameters.BOT_GROWTH_TARGET_HOURS))
    
    # Theoretical increase in BOTs
    theoretical_increase = max(0, target_bots_now - target_bots_prev)
    
    # Add some randomness
    growth = theoretical_increase * random.uniform(0.9, 1.1)
    
    if cumulative_hours < 24 * 90: # 3 months
        # About a 15% chance to increase by 1 (slow initial growth)
        if random.random() < 0.15 * elapsed_hours:
            return max(1 * random.uniform(1, 3), int(growth))
        return 0
    elif cumulative_hours < 24 * 180: # 6 months
        # About a 10% chance to increase by 1 (slow initial growth)
        if random.random() < 0.4 * elapsed_hours:
            return max(1 * random.uniform(1, 3), int(growth))
        return 0
    else:
        # Normal increase (rounded to an integer)
        return max(0, int(growth))

def calculate_active_bots(total_bots, cumulative_hours, parameters=None):
    """
    Calculate the number of active BOTs based on cumulative time.
    
    Args:
        total_bots: Total number of BOTs
        cumulative_hours: Total hours elapsed
        parameters: Simulation parameters (optional, uses default if None)
    """
    if parameters is None:
        parameters = params
        
    # Activity decay based on elapsed time
    activity_rate = max(parameters.MIN_ACTIVITY, 1 - parameters.ACTIVITY_DECAY_PER_HOUR * cumulative_hours)
    return max(1, int(total_bots * activity_rate))

def calculate_dynamic_token_rate(current_total_bots, active_bots_history, previous_token_rate, round_duration_in_hours, parameters=None):
    """
    Dynamically adjust TOKEN_RATE based on user number fluctuations
    
    Args:
        current_total_bots: Current total number of users
        active_bots_history: History of active user counts
        previous_token_rate: Previous TOKEN_RATE
        round_duration_in_hours: Duration of the round in hours
        parameters: Simulation parameters (optional, uses default if None)
        
    Returns:
        new_token_rate: Adjusted TOKEN_RATE
    """
    if parameters is None:
        parameters = params
        
    # Return base rate if no history
    if len(active_bots_history) < 2:
        return parameters.BASE_TOKEN_RATE
    # Limit rate fluctuation for short rounds
    if round_duration_in_hours < 3:
        return parameters.BASE_TOKEN_RATE
    
    # Calculate recent change rate
    prev_active_bots = active_bots_history[-1]
    if prev_active_bots == 0:  # Prevent division by zero
        prev_active_bots = 1
        
    short_term_change = (current_total_bots - prev_active_bots) / prev_active_bots

    # Calculate rate adjustment factor
    adjustment_factor = 0
    """
    ### Since we're adjusting based on total_bots fluctuation, there's no concept of decrease
    if short_term_change < -SIGNIFICANT_CHANGE_THRESHOLD:  # User decrease
        # Promote deflation (rate decrease) during user decrease
        adjustment_factor = (-abs(short_term_change) * USER_DECLINE_SENSITIVITY) * SMOOTHING_FACTOR
    elif short_term_change > SIGNIFICANT_CHANGE_THRESHOLD:  # User increase
        # Promote inflation (rate increase) during user increase * but max 1.0
        adjustment_factor = (short_term_change * USER_GROWTH_SENSITIVITY + 0.005) * SMOOTHING_FACTOR
    else:
        # Promote deflation (rate decrease) when no change
        adjustment_factor = -0.003
    
    new_token_rate = previous_token_rate * (1 + adjustment_factor) * (1 + adjustment_factor)
    """

    # New method
    if short_term_change > parameters.SIGNIFICANT_CHANGE_THRESHOLD: # User increase
        new_token_rate = parameters.MAX_TOKEN_RATE - (parameters.MAX_TOKEN_RATE - previous_token_rate) * math.exp(-0.03)
    else:
        new_token_rate = parameters.MIN_TOKEN_RATE + (previous_token_rate - parameters.MIN_TOKEN_RATE) * math.pow(0.8, 0.17)
    
    # Limit rate range
    new_token_rate = max(parameters.MIN_TOKEN_RATE, min(parameters.MAX_TOKEN_RATE, new_token_rate))
    
    return new_token_rate

def calculate_points_per_bot_per_hour(active_bots, ap_type_data, round_duration, parameters=None):
    """
    Calculate points earned per BOT per hour
    
    Args:
        active_bots: Number of active BOTs
        ap_type_data: AP type settings data
        round_duration: Round duration
        parameters: Simulation parameters (optional, uses default if None)
    
    Returns:
        self_points_per_bot_per_hour: Self-consumption points per BOT per hour
        giving_points_per_bot_per_hour: Points given to others per BOT per hour
    """
    if parameters is None:
        parameters = params
    # Points earned per BOT per round from self-consumption
    self_points_per_bot = ap_type_data['DISTRIBUTION'] * ap_type_data['USAGE_PROB'] * ap_type_data['EARNING']
    
    # Points given per BOT per round
    if active_bots > 1:
        ap_used_per_bot = ap_type_data['DISTRIBUTION'] * ap_type_data['USAGE_PROB']
        giving_points_per_bot = ap_used_per_bot * ap_type_data['GIVING']
    else:
        giving_points_per_bot = 0
    
    # Convert to hourly rate
    self_points_per_bot_per_hour = self_points_per_bot / round_duration
    giving_points_per_bot_per_hour = giving_points_per_bot / round_duration
    
    return self_points_per_bot_per_hour, giving_points_per_bot_per_hour

def calculate_minimum_roi_time(nft_price, token_value, points_per_hour_data, parameters=None):
    """
    Calculate minimum time required for ROI
    
    Args:
        nft_price: NFT price
        token_value: Token value
        points_per_hour_data: Points per hour per BOT data
        parameters: Simulation parameters (optional, uses default if None)
        
    Returns:
        roi_time: ROI time (hours)
    """
    if parameters is None:
        parameters = params
        
    # Tokens earned per hour per BOT
    tokens_per_hour = points_per_hour_data * parameters.TOKEN_RATE
    
    # Convert to USD
    usd_per_hour = tokens_per_hour * token_value
    
    # ROI time
    if usd_per_hour <= 0:
        return float('inf')
    
    return nft_price / usd_per_hour

def update_market_sentiment(previous_sentiment, token_value_change, parameters=None):
    """
    Update market sentiment based on token value changes.
    
    Args:
        previous_sentiment: Previous market sentiment (0-1)
        token_value_change: Percentage change in token value
        parameters: Simulation parameters (optional, uses default if None)
        
    Returns:
        new_sentiment: Updated market sentiment (0-1)
    """
    if parameters is None:
        parameters = params
        
    # Positive change improves sentiment, negative change reduces it
    sentiment_change = token_value_change * 0.5  # Dampening factor
    
    # Add some randomness to sentiment
    random_factor = random.uniform(-parameters.MARKET_SENTIMENT_VOLATILITY, parameters.MARKET_SENTIMENT_VOLATILITY)
    
    # Calculate new sentiment
    new_sentiment = previous_sentiment + sentiment_change + random_factor
    
    # Ensure sentiment stays within bounds
    return max(0.1, min(0.9, new_sentiment))
