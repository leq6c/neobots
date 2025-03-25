import pandas as pd
import numpy as np
import random
from config import params
from utils import *
from token_economy import *
from ap_system import calculate_ap_usage

def run_simulation(parameters=None):
    """
    Main function to run the Neobots simulation.
    
    Args:
        parameters: Simulation parameters (optional, uses default if None)
        
    Returns:
        results: DataFrame with simulation results
        cumulative_tokens: Final token supply
    """
    global final_active_bots
    
    if parameters is None:
        parameters = params
    
    # Prepare a DataFrame to store the results
    columns = [
        "Round", "Round Duration (hours)", "Cumulative Hours", "Total BOTs", "Active BOTs",
        "Total AP Distributed", "Total AP Used", "Total Points Earned",
        "Point-to-NBT Conversion Rate", "NBT Out", "NBT In", "NBT Issued",
        "Tokens Sold", "USD Value of Sold Tokens", "Tokens Purchased", "USD Value of Purchased Tokens", 
        "Market Sentiment", "In Uptrend",
        "Inflation Rate", "Annualized Inflation Rate", "Token Value (Theory)", "Market Cap (Theory)", 
        "Current Round NFT Price", "Minimum ROI Time (hours)", "Team Buyback (USD)",
        # Additional columns: AP purchase and POST usage statistics
        "Additional AP Tokens Spent", 
        "External POST Tokens Spent", 
        "Total Tokens Burned",
        "AP Purchase Users",
        "External POST Users"
    ]
    
    # Add AP-specific result columns
    for ap_type in parameters.AP_TYPES.keys():
        columns.extend([
            f"{ap_type}_AP_Distributed",
            f"{ap_type}_AP_Used",
            f"{ap_type}_Self_Points",
            f"{ap_type}_Giving_Points"
        ])
    
    results = pd.DataFrame(columns=columns)
    
    # Initial state
    total_bots = parameters.INITIAL_BOTS
    cumulative_tokens = parameters.INITIAL_TOKEN_SUPPLY
    cumulative_nft_sales = parameters.INITIAL_NFT_SALES + parameters.INITIAL_LIQUIDITY  # Add initial liquidity
    cumulative_hours = 0
    initial_token_value = parameters.BASE_PRICE  # Initial token value
    market_sentiment = parameters.INITIAL_MARKET_SENTIMENT
    prev_token_value = initial_token_value
    token_value_history = [initial_token_value]  # Track token value history for trend analysis
    
    # Team buyback variables
    team_buyback_remaining = parameters.TEAM_BUYBACK_TOTAL
    team_buyback_per_hour = parameters.TEAM_BUYBACK_TOTAL / parameters.TEAM_BUYBACK_DURATION

    # Initialization
    token_rate = parameters.BASE_TOKEN_RATE
    total_bots_history = []
    
    # Simulation loop
    for round_num in range(1, parameters.MAX_ROUNDS + 1):
        # 1. Calculate the duration of this round
        round_duration = calculate_round_duration(total_bots, parameters)
        cumulative_hours += round_duration
        
        # 2. Update the number of BOTs and active BOTs
        new_bots = simulate_bot_growth(total_bots, round_duration, cumulative_hours, parameters)
        total_bots += new_bots
        active_bots = calculate_active_bots(total_bots, cumulative_hours, parameters)
        final_active_bots = active_bots

        current_round_nft_price = calculate_nft_price(total_bots, parameters)
        
        # 3. Calculate NFT sales (NBT In)
        if new_bots > 0:
            # Estimate the average price for newly added BOTs
            avg_nft_price = calculate_nft_price(total_bots - new_bots/2, parameters)
            nbt_in = avg_nft_price * new_bots
            cumulative_nft_sales += nbt_in
        else:
            nbt_in = 0
        
        # Dynamic TOKEN_RATE adjustment
        token_rate = calculate_dynamic_token_rate(total_bots, total_bots_history, token_rate, round_duration, parameters)
        # Update history
        total_bots_history.append(total_bots)
        if len(total_bots_history) > parameters.TREND_WINDOW_SIZE * 2:  # Limit history size
            total_bots_history.pop(0)
        
        # 4-6. Calculate points for multiple AP types
        total_ap_distribution = 0
        total_ap_used = 0
        total_self_points = 0
        total_giving_points = 0
        total_earnings_per_hour = 0
        
        # Calculate for each AP type
        ap_results = {}
        for ap_type, ap_data in parameters.AP_TYPES.items():
            ap_dist, ap_used, self_points, giving_points, earnings_per_hour = calculate_ap_usage(
                active_bots, ap_data, round_duration, parameters
            )
            
            # Add to totals
            total_ap_distribution += ap_dist
            total_ap_used += ap_used
            total_self_points += self_points
            total_giving_points += giving_points
            total_earnings_per_hour += earnings_per_hour
            
            # Save results
            ap_results[ap_type] = {
                'ap_distribution': ap_dist,
                'ap_used': ap_used,
                'self_points': self_points,
                'giving_points': giving_points
            }
        
        total_points = total_self_points + total_giving_points
        
        # Apply early-stage bonus to boost inflation during startup phase
        if total_bots < parameters.EARLY_STAGE_BOT_THRESHOLD:
            early_stage_bonus = total_points * (parameters.EARLY_STAGE_BONUS_MULTIPLIER - 1)
            total_points += early_stage_bonus
        
        # 7. Calculate token issuance
        new_tokens = total_points * token_rate
        previous_tokens = cumulative_tokens
        cumulative_tokens += new_tokens
        
        # 8. Calculate token value and market cap (preliminary)
        if cumulative_tokens > 0:
            token_value = cumulative_nft_sales / cumulative_tokens
        else:
            token_value = parameters.BASE_PRICE
        
        # 9. Simulate token selling
        tokens_sold, usd_value_sold = calculate_token_sales(
            active_bots, token_value, initial_token_value, cumulative_tokens, market_sentiment, parameters
        )
        
        # 10. Update token value and market cap after token selling
        # When tokens are sold, NBT out increases and market cap decreases
        nbt_out = usd_value_sold
        cumulative_nft_sales -= nbt_out
        
        # 11. Check if we're in an uptrend
        in_uptrend = False
        if len(token_value_history) >= parameters.CONSECUTIVE_INCREASES_FOR_TREND + 1:
            # Check for consecutive increases
            increases = 0
            for i in range(1, parameters.CONSECUTIVE_INCREASES_FOR_TREND + 1):
                if token_value_history[-i] > token_value_history[-i-1] * (1 + parameters.PRICE_INCREASE_THRESHOLD):
                    increases += 1
                else:
                    break  # Break at first non-increase
            
            in_uptrend = (increases >= parameters.CONSECUTIVE_INCREASES_FOR_TREND)
        
        # 12. Simulate token purchases (buy pressure)
        usd_purchased, tokens_purchased = calculate_token_purchases(
            total_bots, new_bots, token_value, token_value_history, market_sentiment, parameters
        )
        
        # 12.5 Team buyback (during set period only)
        team_buyback_usd = 0
        team_buyback_tokens = 0
        
        if cumulative_hours >= parameters.TEAM_BUYBACK_START_HOUR and cumulative_hours <= parameters.TEAM_BUYBACK_START_HOUR + parameters.TEAM_BUYBACK_DURATION and team_buyback_remaining > 0:
            # Base purchase amount for this round
            base_buyback = team_buyback_per_hour * round_duration
            
            # Strengthen buyback during price decline
            price_decline = max(0, (prev_token_value - token_value) / prev_token_value)
            boost_factor = 1.0 + price_decline * 2.0  # Increase buyback based on price decline rate
            
            # Add random variation
            noise = random.uniform(1.0 - parameters.TEAM_BUYBACK_NOISE, 1.0 + parameters.TEAM_BUYBACK_NOISE)
            
            # Calculate buyback amount for this round
            team_buyback_usd = min(team_buyback_remaining, base_buyback * boost_factor * noise)
            team_buyback_remaining -= team_buyback_usd
            
            # Calculate tokens purchased by team
            if token_value > 0:
                team_buyback_tokens = team_buyback_usd / token_value
            
            # Log output
            if round_num % 100 == 0 and team_buyback_usd > 0:
                print(f"Hour {cumulative_hours:.1f}: Team buyback {team_buyback_usd:.2f} USD, " 
                      f"Tokens: {team_buyback_tokens:.2f}, Remaining: {team_buyback_remaining:.2f} USD")
        
        # Update total purchase amount and tokens
        usd_purchased += team_buyback_usd
        tokens_purchased += team_buyback_tokens
        
        # 13. Update cumulative NFT sales with token purchases
        cumulative_nft_sales += usd_purchased
        
        # 14. Recalculate token value after selling and buying
        if cumulative_tokens > 0:
            token_value = cumulative_nft_sales / cumulative_tokens
        
        # Simulate additional AP purchases and external POST usage
        additional_ap_tokens_spent, ap_purchases = simulate_additional_ap_purchases(
            active_bots, token_value, market_sentiment, parameters.AP_TYPES, parameters
        )
        external_post_tokens_spent, post_usages = simulate_external_post_usage(
            total_bots, token_value, market_sentiment, parameters.AP_TYPES, parameters
        )

        # Total token consumption
        total_tokens_burned = (additional_ap_tokens_spent + external_post_tokens_spent) * parameters.TOKEN_BURN_PERCENTAGE

        # Token burning process
        purchase_rate = 0  # Initialize
        if total_tokens_burned > 0:
            # Reduce total supply by burned tokens (with limit check)
            tokens_to_burn = min(total_tokens_burned, cumulative_tokens * 0.01)  # Maximum 1% burn at once
            cumulative_tokens -= tokens_to_burn
            
            # Calculate USD value related to token purchases
            if token_value > 0:
                tokens_purchase_usd = tokens_to_burn * token_value
                usd_purchased += tokens_purchase_usd
                tokens_purchased += tokens_to_burn  # This includes both purchase and burn statistics
                
            # Save purchase rate for calculation
            purchase_rate = parameters.ADDITIONAL_AP_PURCHASE_BASE_RATE * (1 + (market_sentiment - 0.5) * parameters.MARKET_SENTIMENT_EFFECT_ON_PURCHASE)
            purchase_rate = max(0, purchase_rate + random.uniform(-parameters.ADDITIONAL_AP_PURCHASE_VARIANCE, parameters.ADDITIONAL_AP_PURCHASE_VARIANCE))
        
        # Recalculate token value (after burn)
        if cumulative_tokens > 0:
            token_value = cumulative_nft_sales / cumulative_tokens
        
        # 15. Calculate token value change for sentiment update
        token_value_change = (token_value - prev_token_value) / prev_token_value if prev_token_value > 0 else 0
        
        # 16. Update market sentiment
        market_sentiment = update_market_sentiment(market_sentiment, token_value_change, parameters)
        prev_token_value = token_value
        
        # Update token value history
        token_value_history.append(token_value)
        
        # 17. Calculate market cap
        market_cap = token_value * cumulative_tokens
        
        # 18. Calculate inflation rates
        if previous_tokens > 0:
            # Round-to-round inflation rate
            inflation_rate = (new_tokens / previous_tokens) * 100
            
            # Annualized inflation rate (adjusted for round duration)
            annualized_inflation_rate = inflation_rate * (parameters.TARGET_HOURS / round_duration)
        else:
            inflation_rate = 0
            annualized_inflation_rate = 0
        
        # Calculate minimum ROI time based on all AP earnings combined
        min_roi_time = calculate_minimum_roi_time(
            current_round_nft_price, token_value, total_earnings_per_hour, parameters
        )
        
        # 19. Record the simulation results for this round
        # Create basic data
        row_data = [
            round_num, round_duration, cumulative_hours, total_bots, active_bots,
            total_ap_distribution, total_ap_used, total_points,
            token_rate, nbt_out, nbt_in, new_tokens,
            tokens_sold, usd_value_sold, tokens_purchased, usd_purchased,
            market_sentiment, in_uptrend,
            inflation_rate, annualized_inflation_rate, token_value, market_cap, current_round_nft_price,
            min_roi_time, team_buyback_usd,
            # Add AP purchase and POST usage statistics
            additional_ap_tokens_spent,
            external_post_tokens_spent,
            total_tokens_burned,
            int(active_bots * purchase_rate),
            post_usages
        ]
        
        # Add AP-specific detailed data
        for ap_type in parameters.AP_TYPES.keys():
            row_data.extend([
                ap_results[ap_type]['ap_distribution'],
                ap_results[ap_type]['ap_used'],
                ap_results[ap_type]['self_points'],
                ap_results[ap_type]['giving_points']
            ])
        
        results.loc[round_num - 1] = row_data
        
        # 20. End the simulation if it exceeds target hours
        if cumulative_hours >= parameters.TARGET_HOURS:
            print(f"Simulation has reached target time ({parameters.TARGET_HOURS} hours). Ending at round {round_num}.")
            break
    
    # Token burning statistics
    total_burned = results['Total Tokens Burned'].sum()
    burn_percentage = (total_burned / (parameters.INITIAL_TOKEN_SUPPLY + results['NBT Issued'].sum())) * 100
    print(f"\nToken Burning Statistics:")
    print(f"Total tokens burned: {total_burned:.2f} ({burn_percentage:.2f}% of total supply)")
    print(f"Additional AP purchases: {results['Additional AP Tokens Spent'].sum():.2f} tokens")
    print(f"External POST usage: {results['External POST Tokens Spent'].sum():.2f} tokens")
    
    # Return final values for summary
    return results, cumulative_tokens

def display_summary(simulation_results, final_token_supply, parameters=None):
    """
    Display summary statistics at important time points
    
    Args:
        simulation_results: DataFrame with simulation results
        final_token_supply: Final token supply
        parameters: Simulation parameters (optional, uses default if None)
    """
    if parameters is None:
        parameters = params
        
    important_hours = [24, 168, 744, 2232, 4380, 8760]  # 1 day, 1 week, 1 month, 3 months, 6 months, 1 year
    period_names = ["1 day", "1 week", "1 month", "3 months", "6 months", "1 year"]

    print("\nSummary at Key Milestones:")
    print("==========================")
    print("Period | BOTs | Total Token Supply | Token Value | Tokens Sold (USD) | Tokens Bought (USD) | Team Buyback | Market Cap | Min. ROI Time")
    print("-----------------------------------------------------------------------------------------------------------------")

    for i, hours in enumerate(important_hours):
        # Find the closest row to the target hours
        closest_idx = (simulation_results['Cumulative Hours'] - hours).abs().idxmin()
        row = simulation_results.iloc[closest_idx]
        
        # Calculate cumulative tokens at this point
        # As an approximation, calculate the proportion of total time
        time_proportion = hours / parameters.TARGET_HOURS if parameters.TARGET_HOURS > 0 else 0
        cumulative_tokens = parameters.INITIAL_TOKEN_SUPPLY + (final_token_supply - parameters.INITIAL_TOKEN_SUPPLY) * min(1.0, time_proportion)
        
        # Handle infinite ROI time
        roi_time = row['Minimum ROI Time (hours)']
        if np.isinf(roi_time):
            roi_time_str = "N/A"
        else:
            # Convert hours to days for better readability when value is large
            if roi_time > 24:
                roi_time_str = f"{roi_time/24:.1f} days"
            else:
                roi_time_str = f"{roi_time:.1f} hours"
        
        # Compute total team buyback to this point
        team_buyback_to_date = 0
        if hours <= parameters.TEAM_BUYBACK_START_HOUR:
            team_buyback_to_date = 0
        elif hours >= parameters.TEAM_BUYBACK_START_HOUR + parameters.TEAM_BUYBACK_DURATION:
            team_buyback_to_date = parameters.TEAM_BUYBACK_TOTAL
        else:
            team_buyback_to_date = parameters.TEAM_BUYBACK_TOTAL * (hours - parameters.TEAM_BUYBACK_START_HOUR) / parameters.TEAM_BUYBACK_DURATION
        
        print(f"{period_names[i]:8} | {int(row['Total BOTs']):5d} | "
              f"{cumulative_tokens:.0f} | {row['Token Value (Theory)']:.4f} | "
              f"{row['USD Value of Sold Tokens']:.2f} | {row['USD Value of Purchased Tokens']:.2f} | "
              f"{team_buyback_to_date:.2f} | {row['Market Cap (Theory)']:.2f} | {roi_time_str}")

def display_ap_statistics(ap_stats, final_active_bots, parameters=None):
    """
    Display statistics for each AP type
    
    Args:
        ap_stats: AP type statistics
        final_active_bots: Final number of active BOTs
        parameters: Simulation parameters (optional, uses default if None)
    """
    if parameters is None:
        parameters = params
        
    print("\nAP Type Statistics:")
    print("===================")
    print("AP Type | Distribution | Self Points | Giving Points | Total Points | % of Total Points")
    print("-------------------------------------------------------------------------------")

    ap_total_points = 0
    
    # Calculate total points for each AP type
    for ap_type, stats in ap_stats.items():
        ap_total_points += stats['total_points']

    # Calculate percentages and display
    for ap_type, stats in ap_stats.items():
        percentage = (stats['total_points'] / ap_total_points * 100) if ap_total_points > 0 else 0
        distribution = parameters.AP_TYPES[ap_type]['DISTRIBUTION'] * final_active_bots  # Calculate using final round BOT count
        print(f"{ap_type:8} | {distribution:12.1f} | {stats['self_points']:11.1f} | {stats['giving_points']:12.1f} | "
              f"{stats['total_points']:12.1f} | {percentage:18.2f}%")
