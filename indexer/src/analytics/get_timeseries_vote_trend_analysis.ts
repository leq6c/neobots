import { QueryTypes, Sequelize } from "sequelize";

export async function getTimeseriesVoteTrendAnalysis(
  sequelize: Sequelize,
  postPda: string,
  parameterDivisions: number
) {
  let query;
  if (sequelize.getDialect() == "postgres") {
    query = `
WITH 
parameters AS (
  SELECT :parameterDivisions AS divisions,
         :postPda AS target_parent_post_pda
),
vote_data AS (
  SELECT 
    create_transaction_block_time,
    content_parsed_vote_to
  FROM comment
  WHERE content_parsed_vote_to IS NOT NULL 
    AND content_parsed_vote_to != ''
    AND parent_post_pda = (SELECT target_parent_post_pda FROM parameters)
),
time_range AS (
  SELECT 
    MIN(create_transaction_block_time) AS start_time,
    MAX(create_transaction_block_time) AS end_time,
    (MAX(create_transaction_block_time) - MIN(create_transaction_block_time)) AS time_span
  FROM vote_data
),
vote_types AS (
  SELECT DISTINCT content_parsed_vote_to
  FROM vote_data
),
slot_numbers AS (
  SELECT generate_series(0, (SELECT divisions - 1 FROM parameters)) AS slot_number
),
slot_definitions AS (
  SELECT 
    tr.start_time,
    tr.end_time,
    tr.time_span,
    p.divisions,
    sn.slot_number,
    tr.start_time + (tr.time_span * sn.slot_number / p.divisions) AS slot_start,
    CASE 
      WHEN sn.slot_number = p.divisions - 1 THEN tr.end_time
      ELSE tr.start_time + (tr.time_span * (sn.slot_number + 1) / p.divisions)
    END AS slot_end
  FROM slot_numbers sn
  CROSS JOIN time_range tr
  CROSS JOIN parameters p
),
all_combinations AS (
  SELECT 
    sd.slot_number,
    sd.slot_start,
    sd.slot_end,
    vt.content_parsed_vote_to
  FROM slot_definitions sd
  CROSS JOIN vote_types vt
),
votes_by_slot AS (
  SELECT
    ac.slot_number,
    ac.slot_start,
    ac.slot_end,
    ac.content_parsed_vote_to,
    COUNT(vd.create_transaction_block_time) AS votes_in_slot
  FROM 
    all_combinations ac
    LEFT JOIN vote_data vd ON vd.create_transaction_block_time >= ac.slot_start 
                          AND vd.create_transaction_block_time < CASE WHEN ac.slot_number = (SELECT divisions - 1 FROM parameters) THEN ac.slot_end + 0.001 ELSE ac.slot_end END
                          AND vd.content_parsed_vote_to = ac.content_parsed_vote_to
  GROUP BY 
    ac.slot_number, ac.slot_start, ac.slot_end, ac.content_parsed_vote_to
),
cumulative_votes AS (
  SELECT
    slot_number,
    slot_start,
    slot_end,
    content_parsed_vote_to,
    votes_in_slot,
    SUM(votes_in_slot) OVER (
      PARTITION BY content_parsed_vote_to 
      ORDER BY slot_number
    ) AS cumulative_votes
  FROM votes_by_slot
)
SELECT
  slot_number,
  to_timestamp(slot_start) AS time_slot_start,
  to_timestamp(slot_end) AS time_slot_end,
  content_parsed_vote_to AS vote_type,
  votes_in_slot,
  cumulative_votes
FROM cumulative_votes
ORDER BY slot_number, content_parsed_vote_to;
    `;
  } else {
    query = `
WITH 
parameters AS (
  SELECT :parameterDivisions AS divisions,
         :postPda AS target_parent_post_pda
),
vote_data AS (
  SELECT 
    create_transaction_block_time,
    content_parsed_vote_to
  FROM comment
  WHERE content_parsed_vote_to IS NOT NULL 
    AND content_parsed_vote_to != ''
    AND parent_post_pda = (SELECT target_parent_post_pda FROM parameters)
),
time_range AS (
  SELECT 
    MIN(create_transaction_block_time) AS start_time,
    MAX(create_transaction_block_time) AS end_time,
    (MAX(create_transaction_block_time) - MIN(create_transaction_block_time)) AS time_span
  FROM vote_data
),
vote_types AS (
  SELECT DISTINCT content_parsed_vote_to
  FROM vote_data
),
slot_definitions AS (
  SELECT 
    start_time,
    end_time,
    time_span,
    divisions,
    slot_number,
    start_time + (time_span * slot_number / divisions) AS slot_start,
    CASE 
      WHEN slot_number = divisions - 1 THEN end_time
      ELSE start_time + (time_span * (slot_number + 1) / divisions)
    END AS slot_end
  FROM 
    (SELECT slot_number FROM (
      WITH RECURSIVE counter(n) AS (
        SELECT 0
        UNION ALL
        SELECT n+1 FROM counter WHERE n < (SELECT divisions - 1 FROM parameters)
      )
      SELECT n AS slot_number FROM counter
    )) slots,
    time_range,
    parameters
),
all_combinations AS (
  SELECT 
    sd.slot_number,
    sd.slot_start,
    sd.slot_end,
    vt.content_parsed_vote_to
  FROM slot_definitions sd
  CROSS JOIN vote_types vt
),
votes_by_slot AS (
  SELECT
    ac.slot_number,
    ac.slot_start,
    ac.slot_end,
    ac.content_parsed_vote_to,
    COUNT(vd.create_transaction_block_time) AS votes_in_slot
  FROM 
    all_combinations ac
    LEFT JOIN vote_data vd ON vd.create_transaction_block_time >= ac.slot_start 
                          AND vd.create_transaction_block_time < CASE WHEN ac.slot_number = (SELECT divisions - 1 FROM parameters) THEN ac.slot_end + 0.001 ELSE ac.slot_end END
                          AND vd.content_parsed_vote_to = ac.content_parsed_vote_to
  GROUP BY 
    ac.slot_number, ac.slot_start, ac.slot_end, ac.content_parsed_vote_to
),
cumulative_votes AS (
  SELECT
    slot_number,
    slot_start,
    slot_end,
    content_parsed_vote_to,
    votes_in_slot,
    SUM(votes_in_slot) OVER (
      PARTITION BY content_parsed_vote_to 
      ORDER BY slot_number
    ) AS cumulative_votes
  FROM votes_by_slot
)
SELECT
  slot_number,
  datetime(slot_start, 'unixepoch') AS time_slot_start,
  datetime(slot_end, 'unixepoch') AS time_slot_end,
  content_parsed_vote_to AS vote_type,
  votes_in_slot,
  cumulative_votes
FROM cumulative_votes
ORDER BY slot_number, content_parsed_vote_to;
    `;
  }

  return await sequelize.query(query, {
    type: QueryTypes.SELECT,
    replacements: {
      parameterDivisions: parameterDivisions,
      postPda: postPda,
    },
  });
}
