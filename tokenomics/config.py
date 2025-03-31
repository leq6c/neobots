import os

# MPLCONFIGDIR
matplotlib_cache_dir = os.path.join(os.path.expanduser("~"), ".matplotlib_cache")
os.environ["MPLCONFIGDIR"] = matplotlib_cache_dir
os.makedirs(matplotlib_cache_dir, exist_ok=True)


class SimulationParameters:
    """Class to hold all simulation parameters"""

    def __init__(self):
        # Basic simulation parameters
        self.INITIAL_TOKEN_SUPPLY = 10000000  # Increased initial token supply
        self.BASE_PRICE = 40  # Basic NFT price (USD)
        self.INCREASE_FACTOR = 0.2  # Price increase coefficient
        self.TOKEN_RATE = 1  # Conversion rate: 1 point = 1 token
        self.MAX_ROUNDS = 50000  # Maximum number of rounds to simulate
        self.INITIAL_BOTS = 3  # Initial number of BOTs
        self.INITIAL_NFT_SALES = (
            self.BASE_PRICE * self.INITIAL_BOTS
        )  # Initial NFT sales
        self.INITIAL_LIQUIDITY = 2000  # Initial liquidity added

        # Multiple AP type definitions
        # Each AP type has distribution amount, self-consumption reward, and other BOT reward settings
        self.AP_TYPES = {
            "POST": {"DISTRIBUTION": 1, "EARNING": 2, "GIVING": 0, "USAGE_PROB": 0.4},
            "COMMENT": {
                "DISTRIBUTION": 10,
                "EARNING": 1,
                "GIVING": 2,
                "USAGE_PROB": 0.7,
            },
            "LIKE": {
                "DISTRIBUTION": 20,
                "EARNING": 0.5,
                "GIVING": 0.1,
                "USAGE_PROB": 0.9,
            },
            "UPVOTE": {"DISTRIBUTION": 5, "EARNING": 1, "GIVING": 3, "USAGE_PROB": 0.6},
            "DOWNVOTE": {
                "DISTRIBUTION": 2,
                "EARNING": 0.5,
                "GIVING": 0,
                "USAGE_PROB": 0.3,
            },
            "BANVOTE": {
                "DISTRIBUTION": 1,  # Very limited distribution
                "EARNING": 2,  # High reward but not extreme
                "GIVING": 0,
                "USAGE_PROB": 0.05,
                "REPUTATION_REQUIRED": 5,  # Requires a certain reputation score
            },
        }

        # Team buyback settings
        self.TEAM_BUYBACK_TOTAL = 2000  # Total amount for team buyback (USD)
        self.TEAM_BUYBACK_START_HOUR = 50  # Time to start buyback (hours)
        self.TEAM_BUYBACK_DURATION = 200  # Duration of buyback period (hours)
        self.TEAM_BUYBACK_NOISE = 0.3  # Variation coefficient for buyback transactions

        # Simulation time
        self.TARGET_HOURS = 8760 * 2  # Target time (3 years = 365 days * 24 hours * 3)

        # Parameters for BOT growth simulation
        self.MAX_BOTS = 300_000  # Maximum number of BOTs
        self.BOT_GROWTH_TARGET_HOURS = (
            8760 * 2  # Target time (3 years = 365 days * 24 hours * 3)
        )
        # Sigmoid growth parameters
        self.MID_POINT_HOURS = 4380 * 2  # Inflection point (1.5 years)
        self.GROWTH_STEEPNESS = 5.0  # Steepness of growth (adjustment parameter)

        # Activity decay parameters
        self.ACTIVITY_DECAY_PER_HOUR = 0.0001  # Activity decay rate per hour
        self.MIN_ACTIVITY = 0.2  # Minimum activity rate

        # Early stage inflation boost parameters
        self.EARLY_STAGE_BOT_THRESHOLD = 100  # BOTs threshold for early stage
        self.EARLY_STAGE_BONUS_MULTIPLIER = 0  # Points bonus multiplier for early stage

        # Token selling parameters
        self.BASE_SELL_PROBABILITY = (
            0.05  # Base probability of a BOT selling tokens in a round
        )
        self.MAX_SELL_PERCENTAGE = (
            0.2  # Maximum percentage of tokens a BOT can sell at once
        )
        self.SELL_PROBABILITY_INCREASE_WITH_PRICE = (
            0.02  # Increase sell probability as price increases
        )
        self.PRICE_THRESHOLD_FOR_INCREASED_SELLING = (
            2.0  # Price threshold compared to initial price
        )
        self.MARKET_SENTIMENT_VOLATILITY = (
            0.2  # How much market sentiment changes between rounds
        )
        self.INITIAL_MARKET_SENTIMENT = 0.5  # Initial market sentiment (0.0-1.0)

        # Token buying parameters
        self.BOT_THRESHOLD_FOR_BUY_PRESSURE = (
            50  # Minimum number of BOTs to start buy pressure
        )
        self.BASE_BUY_PROBABILITY = (
            0.03  # Base probability of external purchase in a round
        )
        self.UPTREND_BUY_MULTIPLIER = (
            3.0  # Multiplier for buy probability during uptrends
        )
        self.PRICE_INCREASE_THRESHOLD = 0.05  # Percentage increase to identify uptrend
        self.CONSECUTIVE_INCREASES_FOR_TREND = (
            3  # Number of consecutive increases to confirm trend
        )
        self.NEW_USER_BUY_FACTOR = 0.3  # Percentage of new users who also buy tokens
        self.AVERAGE_TOKEN_PURCHASE_USD = 100  # Average USD value of token purchases
        self.MAX_PURCHASE_VARIANCE = 0.7  # Maximum variance in purchase size (0.0-1.0)
        self.WHALE_PROBABILITY = 0.01  # Probability of a "whale" purchase
        self.WHALE_MULTIPLIER = 10.0  # Multiplier for whale purchases

        # Additional AP purchase parameters
        self.ADDITIONAL_AP_PURCHASE_BASE_RATE = (
            0.4  # Base purchase rate for active users
        )
        self.ADDITIONAL_AP_PURCHASE_VARIANCE = 0.1  # Purchase rate variation
        self.ADDITIONAL_AP_PURCHASE_PRICE_FACTOR = 3  # AP price calculation factor
        self.MARKET_SENTIMENT_EFFECT_ON_PURCHASE = (
            0.5  # Effect of market sentiment on purchase rate
        )
        self.TOKEN_BURN_PERCENTAGE = 1.0  # Percentage of token payments to burn (100%)

        # External user POST usage parameters
        self.EXTERNAL_POST_USER_RATIO = 0.4  # Ratio of external POST users to BOT count
        self.EXTERNAL_POST_USAGE_BASE_RATE = 0.4  # Base usage rate for external users
        self.EXTERNAL_POST_PRICE_FACTOR = 1.0  # POST fee calculation factor

        # Parameters for dynamic TOKEN_RATE adjustment
        # Basic parameters
        self.BASE_TOKEN_RATE = 1.0  # Base conversion rate: 1 point = 1 token
        self.MIN_TOKEN_RATE = 0.6  # Minimum conversion rate (deflation)
        self.MAX_TOKEN_RATE = 1.0  # Maximum conversion rate (inflation)

        # Adjustment sensitivity parameters
        self.USER_GROWTH_SENSITIVITY = 0.05  # Sensitivity to user growth
        self.USER_DECLINE_SENSITIVITY = (
            1.2  # Sensitivity to user decline (more sensitive)
        )
        self.SMOOTHING_FACTOR = (
            0.3  # Coefficient to smooth changes (0-1, lower is more gradual)
        )

        # Trend detection parameters
        self.TREND_WINDOW_SIZE = 5  # Number of past rounds used for trend detection
        self.SIGNIFICANT_CHANGE_THRESHOLD = (
            0.0001  # Threshold for significant change (0.1%)
        )


# Create a default instance of the parameters
params = SimulationParameters()
