import matplotlib.pyplot as plt
import numpy as np

from config import params


def visualize_token_rate_vs_user_growth(
    hours, token_rates, total_bots, parameters=None
):
    """
    Visualize the relationship between token rate and user growth

    Args:
        hours: Cumulative hours data
        token_rates: Token rate data
        total_bots: Total BOTs data
        parameters: Simulation parameters (optional, uses default if None)
    """
    if parameters is None:
        parameters = params

    fig, ax1 = plt.subplots(figsize=(14, 8))

    color = "tab:blue"
    ax1.set_xlabel("Cumulative Hours")
    ax1.set_ylabel("Token Rate", color=color)
    ax1.plot(hours, token_rates, color=color)
    ax1.tick_params(axis="y", labelcolor=color)
    ax1.set_ylim(bottom=0)  # Set the minimum value of the y-axis to 0 for Token Rate

    ax2 = ax1.twinx()
    color = "tab:red"
    ax2.set_ylabel("Total BOTs", color=color)
    ax2.plot(hours, total_bots, color=color)
    ax2.tick_params(axis="y", labelcolor=color)
    ax2.set_ylim(bottom=0)  # Set the minimum value of the y-axis to 0 for Total BOTs

    plt.title("Token Rate vs Total BOTs")
    fig.tight_layout()
    plt.grid(True, alpha=0.3)
    plt.savefig("token_rate_vs_users.png")


def create_visualizations(
    simulation_results, final_token_supply, ap_stats, parameters=None
):
    """
    Create all visualizations from simulation results

    Args:
        simulation_results: DataFrame with simulation results
        final_token_supply: Final token supply
        ap_stats: AP type statistics
        parameters: Simulation parameters (optional, uses default if None)
    """
    if parameters is None:
        parameters = params

    try:
        # Plot the number of BOTs and active BOTs over time
        plt.figure(figsize=(14, 8))
        plt.plot(
            simulation_results["Cumulative Hours"],
            simulation_results["Total BOTs"],
            label="Total BOTs",
        )
        plt.plot(
            simulation_results["Cumulative Hours"],
            simulation_results["Active BOTs"],
            label="Active BOTs",
        )

        plt.xlabel("Cumulative Hours")
        plt.ylabel("Number of BOTs")
        plt.title("BOT Growth Over Time")
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.savefig("bot_growth.png")

        # Plot token value and token transactions
        plt.figure(figsize=(14, 10))

        plt.subplot(4, 1, 1)
        plt.plot(
            simulation_results["Cumulative Hours"],
            simulation_results["Token Value (Theory)"],
        )
        plt.ylabel("Token Value")
        plt.title("Token Value Over Time")
        plt.grid(True, alpha=0.3)

        plt.subplot(4, 1, 2)
        plt.plot(
            simulation_results["Cumulative Hours"],
            simulation_results["Tokens Sold"],
            label="Tokens Sold Per Round",
            color="red",
        )
        plt.ylabel("Tokens Sold")
        plt.legend()
        plt.grid(True, alpha=0.3)

        plt.subplot(4, 1, 3)
        plt.plot(
            simulation_results["Cumulative Hours"],
            simulation_results["Tokens Purchased"],
            label="Tokens Purchased Per Round",
            color="green",
        )
        plt.ylabel("Tokens Purchased")
        plt.legend()
        plt.grid(True, alpha=0.3)

        plt.subplot(4, 1, 4)
        plt.plot(
            simulation_results["Cumulative Hours"],
            simulation_results["Market Sentiment"],
            label="Market Sentiment",
            color="blue",
        )
        plt.axhline(y=0.5, color="gray", linestyle="--", alpha=0.5)
        plt.xlabel("Cumulative Hours")
        plt.ylabel("Market Sentiment (0-1)")
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig("token_market_dynamics.png")

        # Plot AP types comparison
        plt.figure(figsize=(14, 10))

        # Self points by AP type
        plt.subplot(2, 1, 1)
        for ap_type in parameters.AP_TYPES.keys():
            plt.plot(
                simulation_results["Cumulative Hours"],
                simulation_results[f"{ap_type}_Self_Points"],
                label=f"{ap_type} Self Points",
            )
        plt.ylabel("Self Points")
        plt.title("Self Points by AP Type Over Time")
        plt.legend()
        plt.grid(True, alpha=0.3)

        # Giving points by AP type
        plt.subplot(2, 1, 2)
        for ap_type in parameters.AP_TYPES.keys():
            plt.plot(
                simulation_results["Cumulative Hours"],
                simulation_results[f"{ap_type}_Giving_Points"],
                label=f"{ap_type} Giving Points",
            )
        plt.xlabel("Cumulative Hours")
        plt.ylabel("Giving Points")
        plt.title("Giving Points by AP Type Over Time")
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig("ap_types_comparison.png")

        # Pie chart of total points by AP type
        plt.figure(figsize=(10, 10))
        labels = []
        sizes = []
        for ap_type, stats in ap_stats.items():
            labels.append(ap_type)
            sizes.append(stats["total_points"])

        plt.pie(sizes, labels=labels, autopct="%1.1f%%", startangle=90)
        plt.axis("equal")
        plt.title("Distribution of Total Points by AP Type")
        plt.savefig("ap_types_pie_chart.png")

        # Plot token supply
        plt.figure(figsize=(14, 8))

        # Calculate cumulative tokens at each point
        time_points = np.linspace(0, parameters.TARGET_HOURS, 100)
        token_supply_points = [
            parameters.INITIAL_TOKEN_SUPPLY
            + (final_token_supply - parameters.INITIAL_TOKEN_SUPPLY)
            * min(1.0, t / parameters.TARGET_HOURS)
            for t in time_points
        ]

        plt.plot(time_points, token_supply_points)
        plt.xlabel("Cumulative Hours")
        plt.ylabel("Total Token Supply")
        plt.title("Token Supply Growth Over Time")
        plt.grid(True, alpha=0.3)
        plt.savefig("token_supply.png")

        # Plot USD values of token transactions
        plt.figure(figsize=(14, 8))

        plt.plot(
            simulation_results["Cumulative Hours"],
            simulation_results["USD Value of Sold Tokens"],
            label="USD Sold",
            color="red",
        )
        plt.plot(
            simulation_results["Cumulative Hours"],
            simulation_results["USD Value of Purchased Tokens"],
            label="USD Purchased",
            color="green",
        )

        plt.xlabel("Cumulative Hours")
        plt.ylabel("USD Value")
        plt.title("Token Transaction Values (USD)")
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.savefig("token_transaction_usd.png")

        # Plot inflation and market cap
        plt.figure(figsize=(14, 8))

        plt.subplot(2, 1, 1)
        plt.plot(
            simulation_results["Cumulative Hours"],
            simulation_results["Annualized Inflation Rate"],
            label="Annualized Inflation",
            color="orange",
        )
        plt.ylabel("Annualized Inflation Rate (%)")
        plt.ylim(0, 1000)  # Set the y-axis limit to a maximum of 1000%
        plt.legend()
        plt.grid(True, alpha=0.3)

        plt.subplot(2, 1, 2)
        plt.plot(
            simulation_results["Cumulative Hours"],
            simulation_results["Market Cap (Theory)"],
        )
        plt.xlabel("Cumulative Hours")
        plt.ylabel("Market Cap")
        plt.title("Market Cap Over Time")
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig("inflation_market_cap.png")

        # Plot ROI Time
        plt.figure(figsize=(14, 8))
        # Filter out infinite values
        valid_roi = simulation_results[
            ~np.isinf(simulation_results["Minimum ROI Time (hours)"])
        ]
        plt.plot(
            valid_roi["Cumulative Hours"], valid_roi["Minimum ROI Time (hours)"] / 24
        )  # Convert to days
        plt.xlabel("Cumulative Hours")
        plt.ylabel("Minimum ROI Time (days)")
        plt.title("Minimum Time to Recover NFT Investment")
        plt.grid(True, alpha=0.3)
        plt.savefig("minimum_roi_time.png")

        # Plot team buyback
        plt.figure(figsize=(14, 8))

        # Team buyback data
        team_buyback_data = simulation_results["Team Buyback (USD)"]
        cumulative_team_buyback = team_buyback_data.cumsum()

        plt.plot(simulation_results["Cumulative Hours"], cumulative_team_buyback)
        plt.axhline(
            y=parameters.TEAM_BUYBACK_TOTAL,
            color="red",
            linestyle="--",
            label=f"Total Budget: {parameters.TEAM_BUYBACK_TOTAL} USD",
        )

        plt.xlabel("Cumulative Hours")
        plt.ylabel("Cumulative Team Buyback (USD)")
        plt.title("Team Buyback Over Time")
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.savefig("team_buyback.png")

        # Plot NFT price
        plt.figure(figsize=(14, 8))
        plt.plot(
            simulation_results["Cumulative Hours"],
            simulation_results["Current Round NFT Price"],
        )
        plt.xlabel("Cumulative Hours")
        plt.ylabel("NFT Price (USD)")
        plt.title("NFT Price Over Time")
        plt.grid(True, alpha=0.3)
        plt.savefig("nft_price.png")

        # Plot NFT price and ROI time together
        plt.figure(figsize=(14, 8))

        # Two Y axes
        fig, ax1 = plt.subplots(figsize=(14, 8))

        # NFT price
        color = "tab:blue"
        ax1.set_xlabel("Cumulative Hours")
        ax1.set_ylabel("NFT Price (USD)", color=color)
        ax1.plot(
            simulation_results["Cumulative Hours"],
            simulation_results["Current Round NFT Price"],
            color=color,
        )
        ax1.tick_params(axis="y", labelcolor=color)

        # ROI time on second Y axis
        ax2 = ax1.twinx()
        color = "tab:red"
        ax2.set_ylabel("ROI Time (days)", color=color)
        # Filter out infinite values
        valid_roi = simulation_results[
            ~np.isinf(simulation_results["Minimum ROI Time (hours)"])
        ]
        ax2.plot(
            valid_roi["Cumulative Hours"],
            valid_roi["Minimum ROI Time (hours)"] / 24,
            color=color,
        )
        ax2.tick_params(axis="y", labelcolor=color)

        plt.title("NFT Price vs ROI Time")
        fig.tight_layout()
        plt.grid(True, alpha=0.3)
        plt.savefig("nft_price_vs_roi.png")

        # Visualize token rate vs user growth
        visualize_token_rate_vs_user_growth(
            simulation_results["Cumulative Hours"],
            simulation_results["Point-to-NBT Conversion Rate"],
            simulation_results["Total BOTs"],
            parameters,
        )

        # Token burning graph
        plt.figure(figsize=(14, 8))
        plt.plot(
            simulation_results["Cumulative Hours"],
            simulation_results["Total Tokens Burned"],
            label="Tokens Burned Per Round",
            color="purple",
        )
        plt.xlabel("Cumulative Hours")
        plt.ylabel("Tokens Burned Per Round")
        plt.title("Token Burning Over Time")
        plt.grid(True, alpha=0.3)
        plt.savefig("token_burning.png")

        # AP purchase and external POST usage graph
        plt.figure(figsize=(14, 8))
        plt.plot(
            simulation_results["Cumulative Hours"],
            simulation_results["Additional AP Tokens Spent"],
            label="AP Purchase",
            color="blue",
        )
        plt.plot(
            simulation_results["Cumulative Hours"],
            simulation_results["External POST Tokens Spent"],
            label="External POST",
            color="green",
        )
        plt.xlabel("Cumulative Hours")
        plt.ylabel("Tokens Spent")
        plt.title("Token Utility Usage")
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.savefig("token_utility.png")

        # Cumulative token burning graph
        cumulative_burned = simulation_results["Total Tokens Burned"].cumsum()
        plt.figure(figsize=(14, 8))
        plt.plot(simulation_results["Cumulative Hours"], cumulative_burned)
        plt.xlabel("Cumulative Hours")
        plt.ylabel("Cumulative Tokens Burned")
        plt.title("Cumulative Token Burning")
        plt.grid(True, alpha=0.3)
        plt.savefig("cumulative_token_burning.png")

        """
         plt.figure(figsize=(14, 8), facecolor="red", edgecolor="blue")
        plt.plot(
            simulation_results["Round"],
            simulation_results["Round Duration (hours)"],
            linewidth=5,
        )
        # set color of the frame to white
        for spine in plt.gca().spines.values():
            spine.set_visible(False)
        # set tick color to white
        plt.xticks(color="white")
        plt.yticks(color="white")
        plt.xlabel("Round", color="white")  # text
        plt.ylabel("Round Duration (hours)", color="white")  # text
        plt.title("Round Duration Over Time", color="white")  # text
        plt.grid(True, color="white", alpha=0.3)  # grid color
        plt.savefig("round_duration.png", transparent=True)
        """

        # Token supply vs burning comparison
        plt.figure(figsize=(14, 8))

        for spine in plt.gca().spines.values():
            spine.set_visible(False)

        # Estimate token supply
        time_points = simulation_results["Cumulative Hours"]
        token_supply_points = (
            parameters.INITIAL_TOKEN_SUPPLY
            + simulation_results["NBT Issued"].cumsum()
            - cumulative_burned
        )

        plt.plot(
            time_points,
            token_supply_points,
            label="Adjusted Token Supply",
            color="blue",
            linewidth=5,
        )
        plt.plot(
            time_points,
            parameters.INITIAL_TOKEN_SUPPLY + simulation_results["NBT Issued"].cumsum(),
            label="Token Supply without Burning",
            color="red",
            linestyle="--",
            linewidth=5,
        )
        plt.plot(
            time_points,
            cumulative_burned,
            label="Cumulative Tokens Burned",
            color="green",
            linewidth=5,
        )

        plt.xticks(color="white")
        plt.yticks(color="white")
        plt.xlabel("Cumulative Hours", color="white")
        plt.ylabel("Tokens", color="white")
        plt.title("Token Supply vs Burning", color="white")
        plt.legend()
        plt.grid(True, color="white", alpha=0.3)
        plt.savefig("token_supply_vs_burning.png", transparent=True)

        # Token value vs burn rate relationship
        plt.figure(figsize=(14, 8))

        # Calculate burn rate at each point (total burned / total issued)
        total_issued = (
            parameters.INITIAL_TOKEN_SUPPLY + simulation_results["NBT Issued"].cumsum()
        )
        burn_percentage = (cumulative_burned / total_issued) * 100

        fig, ax1 = plt.subplots(figsize=(14, 8))

        color = "tab:blue"
        ax1.set_xlabel("Cumulative Hours")
        ax1.set_ylabel("Token Value", color=color)
        ax1.plot(time_points, simulation_results["Token Value (Theory)"], color=color)
        ax1.tick_params(axis="y", labelcolor=color)

        ax2 = ax1.twinx()
        color = "tab:red"
        ax2.set_ylabel("Burn Percentage (%)", color=color)
        ax2.plot(time_points, burn_percentage, color=color)
        ax2.tick_params(axis="y", labelcolor=color)

        plt.title("Token Value vs Burn Percentage")
        fig.tight_layout()
        plt.grid(True, alpha=0.3)
        plt.savefig("token_value_vs_burn.png")

        # Utility users count
        plt.figure(figsize=(14, 8))
        plt.plot(
            simulation_results["Cumulative Hours"],
            simulation_results["AP Purchase Users"],
            label="AP Purchase Users",
            color="blue",
        )
        plt.plot(
            simulation_results["Cumulative Hours"],
            simulation_results["External POST Users"],
            label="External POST Users",
            color="green",
        )
        plt.xlabel("Cumulative Hours")
        plt.ylabel("Number of Users")
        plt.title("Utility User Count")
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.savefig("utility_users.png")

        # POST-using DAU graph
        plt.figure(figsize=(14, 8))
        # Calculate users using POST (active users × POST usage probability)
        post_dau = (
            simulation_results["Active BOTs"]
            * parameters.AP_TYPES["POST"]["USAGE_PROB"]
        )
        # Add external POST users
        total_post_dau = post_dau + simulation_results["External POST Users"]

        plt.plot(
            simulation_results["Cumulative Hours"],
            post_dau,
            label="BOT Users Using POST",
            color="blue",
        )
        plt.plot(
            simulation_results["Cumulative Hours"],
            simulation_results["External POST Users"],
            label="External POST Users",
            color="green",
        )
        plt.plot(
            simulation_results["Cumulative Hours"],
            total_post_dau,
            label="Total POST DAU",
            color="red",
        )
        plt.xlabel("Cumulative Hours")
        plt.ylabel("Daily Active Users")
        plt.title("Daily Active Users Using POST")
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.savefig("post_dau.png")

        # POST daily usage count and value graph
        fig, ax1 = plt.subplots(figsize=(14, 8))

        # Usage count
        color = "tab:blue"
        ax1.set_xlabel("Cumulative Hours")
        ax1.set_ylabel("Daily POST Usage Count", color=color)
        ax1.plot(
            simulation_results["Cumulative Hours"],
            simulation_results["External POST Users"],
            color=color,
        )
        ax1.tick_params(axis="y", labelcolor=color)

        # USD value of usage
        ax2 = ax1.twinx()
        color = "tab:red"
        ax2.set_ylabel("Daily POST Usage (USD)", color=color)
        # Convert to USD using token value
        post_usage_usd = (
            simulation_results["External POST Tokens Spent"]
            * simulation_results["Token Value (Theory)"]
        )
        ax2.plot(simulation_results["Cumulative Hours"], post_usage_usd, color=color)
        ax2.tick_params(axis="y", labelcolor=color)

        plt.title("Daily POST Usage Count and USD Value")
        fig.tight_layout()
        plt.grid(True, alpha=0.3)
        plt.savefig("post_usage.png")

        # AP purchase graphs
        # AP purchase DAU
        plt.figure(figsize=(14, 8))
        plt.plot(
            simulation_results["Cumulative Hours"],
            simulation_results["AP Purchase Users"],
            label="Daily AP Purchase Users",
            color="purple",
        )
        plt.xlabel("Cumulative Hours")
        plt.ylabel("Daily Active Users")
        plt.title("Daily Active Users Purchasing AP")
        plt.grid(True, alpha=0.3)
        plt.savefig("ap_purchase_dau.png")

        # AP purchase daily count and value
        fig, ax1 = plt.subplots(figsize=(14, 8))

        # Purchase count (using user count as proxy)
        color = "tab:blue"
        ax1.set_xlabel("Cumulative Hours")
        ax1.set_ylabel("Daily AP Purchase Count", color=color)
        ax1.plot(
            simulation_results["Cumulative Hours"],
            simulation_results["AP Purchase Users"],
            color=color,
        )
        ax1.tick_params(axis="y", labelcolor=color)

        # USD value of purchases
        ax2 = ax1.twinx()
        color = "tab:red"
        ax2.set_ylabel("Daily AP Purchase (USD)", color=color)
        # Convert to USD using token value
        ap_purchase_usd = (
            simulation_results["Additional AP Tokens Spent"]
            * simulation_results["Token Value (Theory)"]
        )
        ax2.plot(simulation_results["Cumulative Hours"], ap_purchase_usd, color=color)
        ax2.tick_params(axis="y", labelcolor=color)

        plt.title("Daily AP Purchase Count and USD Value")
        fig.tight_layout()
        plt.grid(True, alpha=0.3)
        plt.savefig("ap_purchase.png")

        # POST amount per transaction trend
        plt.figure(figsize=(14, 8))
        # Calculate tokens per POST transaction
        # Prevent division by zero
        post_per_transaction = np.zeros(len(simulation_results))
        post_per_transaction_usd = np.zeros(len(simulation_results))

        for i in range(len(simulation_results)):
            if simulation_results["External POST Users"].iloc[i] > 0:
                post_per_transaction[i] = (
                    simulation_results["External POST Tokens Spent"].iloc[i]
                    / simulation_results["External POST Users"].iloc[i]
                )
                post_per_transaction_usd[i] = (
                    post_per_transaction[i]
                    * simulation_results["Token Value (Theory)"].iloc[i]
                )

        # Plot both token and USD values
        """
        plt.plot(simulation_results['Cumulative Hours'], post_per_transaction, 
                 label='Tokens per POST', color='blue')
        """
        plt.plot(
            simulation_results["Cumulative Hours"],
            post_per_transaction_usd,
            label="USD per POST",
            color="red",
        )
        plt.xlabel("Cumulative Hours")
        plt.ylabel("Amount per POST Transaction")
        plt.title("Amount per POST Transaction Over Time")
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.savefig("post_per_transaction.png")

        # AP amount per transaction trend
        plt.figure(figsize=(14, 8))
        # Calculate tokens per AP purchase
        # Prevent division by zero
        ap_per_transaction = np.zeros(len(simulation_results))
        ap_per_transaction_usd = np.zeros(len(simulation_results))

        for i in range(len(simulation_results)):
            if simulation_results["AP Purchase Users"].iloc[i] > 0:
                ap_per_transaction[i] = (
                    simulation_results["Additional AP Tokens Spent"].iloc[i]
                    / simulation_results["AP Purchase Users"].iloc[i]
                )
                ap_per_transaction_usd[i] = (
                    ap_per_transaction[i]
                    * simulation_results["Token Value (Theory)"].iloc[i]
                )

        # Plot both token and USD values
        """
        plt.plot(simulation_results['Cumulative Hours'], ap_per_transaction, 
                 label='Tokens per AP Purchase', color='blue')
        """
        plt.plot(
            simulation_results["Cumulative Hours"],
            ap_per_transaction_usd,
            label="USD per AP Purchase",
            color="red",
        )
        plt.xlabel("Cumulative Hours")
        plt.ylabel("Amount per AP Purchase")
        plt.title("Amount per AP Purchase Over Time")
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.savefig("ap_per_transaction.png")

        # Plot round duration
        plt.figure(figsize=(14, 8), facecolor="red", edgecolor="white")
        plt.plot(
            simulation_results["Round"],
            simulation_results["Round Duration (hours)"],
            linewidth=3,
            color="blue",
        )
        # set color of the frame to white
        for spine in plt.gca().spines.values():
            spine.set_visible(False)
        # set tick color to white
        plt.xticks(color="white")
        plt.yticks(color="white")
        plt.xlabel("Round", color="white")  # text
        plt.ylabel("Round Duration (hours)", color="white")  # text
        plt.title("Round Duration Over Time", color="white")  # text
        plt.grid(True, color="white", alpha=0.3)  # grid color
        plt.savefig("round_duration.png", transparent=True)

        # Plot round duration by bot count
        plt.figure(figsize=(14, 8), facecolor="red", edgecolor="white")
        plt.plot(
            simulation_results["Total BOTs"],
            simulation_results["Round Duration (hours)"],
            linewidth=3,
            color="white",
        )
        for spine in plt.gca().spines.values():
            spine.set_visible(False)
        plt.xticks(color="white")
        plt.yticks(color="white")
        plt.xlabel("Bot Count", color="white")  # text
        plt.ylabel("Round Duration (hours)", color="white")  # text
        plt.title("Round Duration Over Bot Count", color="white")  # text
        plt.grid(True, color="white", alpha=0.3)  # grid color
        plt.savefig("round_duration_by_bot_count.png", transparent=True)

        print(
            "Graphs saved: bot_growth.png, token_market_dynamics.png, ap_types_comparison.png, ap_types_pie_chart.png, token_supply.png, token_transaction_usd.png, inflation_market_cap.png, minimum_roi_time.png, team_buyback.png, nft_price.png, nft_price_vs_roi.png, token_rate_vs_users.png, round_duration.png"
        )
        print(
            "Additional graphs saved: token_burning.png, token_utility.png, cumulative_token_burning.png, token_supply_vs_burning.png, token_value_vs_burn.png, utility_users.png"
        )
    except ImportError:
        print("matplotlib is not installed, so graphs were not generated.")
