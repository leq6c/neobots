import random
from config import params
from utils import calculate_ap_price

def calculate_token_sales(active_bots, token_value, initial_token_value, cumulative_tokens, market_sentiment, parameters=None):
    """
    Calculate token sales based on various factors.
    
    Args:
        active_bots: Number of active BOTs
        token_value: Current token value
        initial_token_value: Initial token value
        cumulative_tokens: Total tokens in circulation
        market_sentiment: Market sentiment factor (0-1)
        parameters: Simulation parameters (optional, uses default if None)
        
    Returns:
        tokens_sold: Number of tokens sold
        usd_value: USD value of sold tokens
    """
    if parameters is None:
        parameters = params
        
    # Base probability of selling is influenced by price increase and market sentiment
    price_ratio = token_value / initial_token_value if initial_token_value > 0 else 1.0
    sell_probability_modifier = max(0, (price_ratio - parameters.PRICE_THRESHOLD_FOR_INCREASED_SELLING) * parameters.SELL_PROBABILITY_INCREASE_WITH_PRICE)
    
    # Market sentiment affects selling (lower sentiment = more selling)
    sentiment_factor = 1.0 - market_sentiment
    
    # Calculate final sell probability
    sell_probability = parameters.BASE_SELL_PROBABILITY + sell_probability_modifier * sentiment_factor
    
    # Calculate tokens per BOT (rough approximation)
    avg_tokens_per_bot = cumulative_tokens / active_bots if active_bots > 0 else 0
    
    # Number of BOTs that decide to sell
    selling_bots = int(active_bots * sell_probability)
    
    # For each selling BOT, determine how much they sell
    total_tokens_sold = 0
    for _ in range(selling_bots):
        # Each BOT sells a random percentage of their tokens
        sell_percentage = random.uniform(0.05, parameters.MAX_SELL_PERCENTAGE)
        tokens_sold = avg_tokens_per_bot * sell_percentage
        total_tokens_sold += tokens_sold
    
    # Calculate USD value
    usd_value = total_tokens_sold * token_value
    
    return total_tokens_sold, usd_value

def calculate_token_purchases(total_bots, new_bots, token_value, token_value_history, market_sentiment, parameters=None):
    """
    Calculate token purchases based on market trends and user growth.
    
    Args:
        total_bots: Current total number of BOTs
        new_bots: Number of new BOTs in this round
        token_value: Current token value
        token_value_history: List of token values from previous rounds
        market_sentiment: Current market sentiment (0-1)
        parameters: Simulation parameters (optional, uses default if None)
        
    Returns:
        usd_purchased: USD value of tokens purchased
        tokens_purchased: Number of tokens purchased
    """
    if parameters is None:
        parameters = params
        
    # No buying pressure until minimum threshold of users is reached
    if total_bots < parameters.BOT_THRESHOLD_FOR_BUY_PRESSURE:
        return 0, 0
    
    # Check if we're in an uptrend (require at least CONSECUTIVE_INCREASES_FOR_TREND data points)
    in_uptrend = False
    if len(token_value_history) >= parameters.CONSECUTIVE_INCREASES_FOR_TREND:
        # Check the last CONSECUTIVE_INCREASES_FOR_TREND values for consistent increases
        increases = 0
        for i in range(1, parameters.CONSECUTIVE_INCREASES_FOR_TREND + 1):
            if i >= len(token_value_history):
                break
            if token_value_history[-i] > token_value_history[-i-1] * (1 + parameters.PRICE_INCREASE_THRESHOLD):
                increases += 1
        
        in_uptrend = (increases >= parameters.CONSECUTIVE_INCREASES_FOR_TREND)
    
    # Base probability adjusted by market sentiment and trend
    buy_probability = parameters.BASE_BUY_PROBABILITY * market_sentiment
    
    # Increase buy probability during uptrends
    if in_uptrend:
        buy_probability *= parameters.UPTREND_BUY_MULTIPLIER
    
    # Calculate number of existing users who buy tokens
    existing_bots = total_bots - new_bots
    existing_buyers = int(existing_bots * buy_probability)
    
    # Calculate number of new users who also buy tokens (separate from NFT purchase)
    new_buyers = int(new_bots * parameters.NEW_USER_BUY_FACTOR)
    
    total_buyers = existing_buyers + new_buyers
    
    # Calculate total USD value of purchases
    total_usd_purchased = 0
    for _ in range(total_buyers):
        # Randomize purchase amount around the average
        variance = random.uniform(-parameters.MAX_PURCHASE_VARIANCE, parameters.MAX_PURCHASE_VARIANCE)
        purchase_amount = parameters.AVERAGE_TOKEN_PURCHASE_USD * (1 + variance)
        
        # Check for whale purchases (large buyers)
        if random.random() < parameters.WHALE_PROBABILITY:
            purchase_amount *= parameters.WHALE_MULTIPLIER
            
        total_usd_purchased += purchase_amount
    
    # Convert USD to tokens
    if token_value > 0:
        tokens_purchased = total_usd_purchased / token_value
    else:
        tokens_purchased = 0
    
    return total_usd_purchased, tokens_purchased

def simulate_additional_ap_purchases(active_bots, token_value, market_sentiment, ap_types, parameters=None):
    """
    Simulate additional AP purchases by users
    
    Args:
        active_bots: Number of active users
        token_value: Current token value
        market_sentiment: Market sentiment (0-1)
        ap_types: AP type configuration data
        parameters: Simulation parameters (optional, uses default if None)
        
    Returns:
        total_tokens_spent: Total tokens spent
        ap_purchases: AP purchases by type
    """
    if parameters is None:
        parameters = params
        
    # Adjust base purchase rate by market sentiment (higher sentiment = more purchases)
    adjusted_purchase_rate = parameters.ADDITIONAL_AP_PURCHASE_BASE_RATE * (1 + (market_sentiment - 0.5) * parameters.MARKET_SENTIMENT_EFFECT_ON_PURCHASE)
    
    # Add variation to purchase rate
    purchase_rate = max(0, adjusted_purchase_rate + random.uniform(-parameters.ADDITIONAL_AP_PURCHASE_VARIANCE, parameters.ADDITIONAL_AP_PURCHASE_VARIANCE))
    
    # Calculate number of purchasing users
    purchasing_users = int(active_bots * purchase_rate)
    
    total_tokens_spent = 0
    ap_purchases = {}
    
    # Calculate purchases for each AP type
    for ap_type, ap_data in ap_types.items():
        # Purchase probability for this AP type (proportional to usage probability)
        purchase_probability = ap_data['USAGE_PROB']
        
        # Price for this AP type
        ap_price = calculate_ap_price(ap_data, parameters)
        
        # Calculate purchases
        purchases_of_this_type = 0
        for _ in range(purchasing_users):
            # Check if user purchases this AP type
            if random.random() < purchase_probability:
                # Random purchase quantity (1-5)
                quantity = random.randint(1, 5)
                purchases_of_this_type += quantity
                
                # Calculate token spending
                tokens_spent = ap_price * quantity
                total_tokens_spent += tokens_spent
        
        ap_purchases[ap_type] = purchases_of_this_type
    
    # Reduce purchases if token value is too low
    if token_value < 0.001:
        total_tokens_spent *= token_value * 1000  # Decrease purchases as value decreases
    
    return total_tokens_spent, ap_purchases

def calculate_external_post_fee(ap_types, active_bots, parameters=None):
    """
    Calculate fee for external user POST usage (in token units)
    
    Args:
        ap_types: AP type configuration data
        active_bots: Number of active BOTs
        parameters: Simulation parameters (optional, uses default if None)
    """
    if parameters is None:
        parameters = params
        
    # Sum of all AP type distributions and rewards
    total_ap_distribution = sum(ap_data['DISTRIBUTION'] for ap_data in ap_types.values())
    total_points = sum(max(ap_data['EARNING'], ap_data['GIVING']) for ap_data in ap_types.values())
    
    # Base fee per user = distribution × total points
    base_fee = total_ap_distribution * total_points * parameters.EXTERNAL_POST_PRICE_FACTOR
    
    # Fee increases with user count (reflecting demand and value increase)
    # user_factor = max(1.0, math.log10(active_bots + 1))
    user_factor = 1.0
    
    return base_fee * user_factor / 50

def simulate_external_post_usage(total_bots, token_value, market_sentiment, ap_types, parameters=None):
    """
    Simulate POST usage by external users without BOTs
    
    Args:
        total_bots: Total BOT count
        token_value: Current token value
        market_sentiment: Market sentiment (0-1)
        ap_types: AP type configuration data
        parameters: Simulation parameters (optional, uses default if None)
        
    Returns:
        total_tokens_spent: Total tokens spent
        post_usages: Number of usages
    """
    if parameters is None:
        parameters = params
        
    # Calculate number of external POST users
    external_users = int(total_bots * parameters.EXTERNAL_POST_USER_RATIO)
    
    # Adjust base usage rate by market sentiment
    adjusted_usage_rate = parameters.EXTERNAL_POST_USAGE_BASE_RATE * (1 + (market_sentiment - 0.5) * 0.3)
    
    # Add variation to usage rate
    usage_rate = max(0, adjusted_usage_rate + random.uniform(-0.05, 0.05))
    
    # Calculate usage count
    post_usages = int(external_users * usage_rate)
    
    # Calculate POST fee
    post_fee = calculate_external_post_fee(ap_types, total_bots, parameters)
    
    # Total token spending
    total_tokens_spent = post_usages * post_fee
    
    # Reduce usage if token value is too low
    if token_value < 0.001:
        total_tokens_spent *= token_value * 1000  # Decrease usage as value decreases
    
    return total_tokens_spent, post_usages
