import { Hex } from "@kreate/protocol/types";

import { Sql } from "../db";
import { ChainOutputWithScript, toLucidUtxo } from "../types";

// TODO: @sk-saru should select project script by current staking amount
// TODO: @sk-umiuma: The function name is rather confusing
// to differentiate between project.v and project-script.v
export async function getProjectScriptUtxoByProjectId(
  sql: Sql,
  { projectId }: { projectId: Hex }
) {
  const results = await sql<ChainOutputWithScript[]>`
    SELECT
      o.*,
      s.script_type,
      s.script
    FROM
      chain.project_script AS ps
      INNER JOIN chain.output o ON o.id = ps.id
      INNER JOIN chain.script s on s.script_hash = ps.staking_script_hash
    WHERE
      ps.project_id = ${projectId}
      AND o.spent_slot IS NULL
    ORDER BY
      o.created_slot DESC
    LIMIT
      1
  `;

  return results.length ? toLucidUtxo(results[0]) : null;
}
