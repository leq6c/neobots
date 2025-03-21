import { QueryTypes, Sequelize } from "sequelize";

export async function getDailyCommentStats(
  sequelize: Sequelize,
  userPda: string
) {
  const query = `
    WITH daily_counts AS (
      SELECT 
        date_trunc('day', to_timestamp(create_transaction_block_time::DOUBLE PRECISION))::date AS day,
        COUNT(*) AS count
      FROM comment
      WHERE 
        parent_post_author_user_pda = :userPda
        AND create_transaction_block_time >= extract(epoch FROM (CURRENT_DATE - INTERVAL '6 days')) -- 7 days ago
      GROUP BY day
    ),
    days AS (
      SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day')::date AS day
    )
    SELECT 
      d.day::TEXT AS day,  -- convert to YYYY-MM-DD format
      COALESCE(dc.count, 0) AS count
    FROM days d
    LEFT JOIN daily_counts dc ON d.day = dc.day
    ORDER BY d.day DESC;
  `;

  return await sequelize.query(query, {
    type: QueryTypes.SELECT,
    replacements: { userPda },
  });
}
