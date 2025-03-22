import { QueryTypes, Sequelize } from "sequelize";

export async function getDailyRewardStats(
  sequelize: Sequelize,
  userPda: string
) {
  let query;
  if (sequelize.getDialect() == "postgres") {
    query = `
    WITH daily_counts AS (
      SELECT 
        date_trunc('day', to_timestamp(create_transaction_block_time::DOUBLE PRECISION))::date AS day,
        COUNT(*) AS count
      FROM reward
      WHERE 
        receiver_user_pda = :userPda
        AND create_transaction_block_time >= extract(epoch FROM (CURRENT_DATE - INTERVAL '6 days')) -- 7 days ago
      GROUP BY day
    ),
    -- 7 days of consecutive dates
    days AS (
      SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day')::date AS day
    )
    -- combine data for all dates, and set count = 0 for missing days
    SELECT 
      d.day::TEXT AS day,  -- convert to YYYY-MM-DD format
      COALESCE(dc.count, 0) AS count
    FROM days d
    LEFT JOIN daily_counts dc ON d.day = dc.day
    ORDER BY d.day DESC;
  `;
  } else {
    query = `
    WITH RECURSIVE days(day) AS (
    -- Start at 'today' minus 6 days
    SELECT date('now', '-6 days')
    UNION ALL
    -- Recursively add 1 day until today
    SELECT date(day, '+1 day')
    FROM days
    WHERE day < date('now')
),
daily_counts AS (
    SELECT
        date(create_transaction_block_time, 'unixepoch') AS day,
        COUNT(*) AS count
    FROM reward
    WHERE 
        receiver_user_pda = :userPda
        -- only include rows from the last 7 days
        AND create_transaction_block_time >= strftime('%s', 'now', '-6 days')
    GROUP BY day
)
SELECT 
    d.day AS day,
    COALESCE(dc.count, 0) AS count
FROM days d
LEFT JOIN daily_counts dc ON d.day = dc.day
ORDER BY d.day DESC;

    `;
  }

  /*
  sample utput:
  [
  { day: '2025-03-21', count: '30' },
  { day: '2025-03-20', count: '0' },
  { day: '2025-03-19', count: '28' },
  { day: '2025-03-18', count: '0' },
  { day: '2025-03-17', count: '0' },
  { day: '2025-03-16', count: '0' },
  { day: '2025-03-15', count: '0' }
]
  */

  return await sequelize.query(query, {
    type: QueryTypes.SELECT,
    replacements: { userPda },
  });
}
