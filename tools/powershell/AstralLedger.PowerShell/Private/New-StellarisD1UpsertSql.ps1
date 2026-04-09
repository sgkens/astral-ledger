function New-StellarisD1UpsertSql {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [pscustomobject]$NormalizedPayload
    )

    $snapshot = $NormalizedPayload.sourceSnapshot
    $items = @($NormalizedPayload.items)

    if (-not $snapshot) {
        throw 'Normalized payload must contain sourceSnapshot metadata.'
    }

    $sourceName = switch ($NormalizedPayload.entityType) {
        'trait' { 'Stellaris Wiki Traits' }
        'ethic' { 'Stellaris Wiki Ethics' }
        'authority' { 'Stellaris Wiki Government' }
        default { "Stellaris Wiki $($NormalizedPayload.entityType)" }
    }

    $sourceKind = 'wiki'
    $sourceUrl = if ($snapshot.url) { $snapshot.url } else { 'https://stellaris.paradoxwikis.com/Stellaris_Wiki' }
    $contentHash = $snapshot.contentHash
    $fetchedAt = if ($snapshot.fetchedAt) { $snapshot.fetchedAt } else { (Get-Date).ToUniversalTime().ToString('o') }
    $storageKey = $snapshot.storageKey
    $contentType = 'text/html'
    $byteLength = if ($snapshot.byteLength) { [int]$snapshot.byteLength } else { 0 }
    $runSummary = "Ingest $($NormalizedPayload.entityType) count=$(@($items).Count) hash=$contentHash"

    $sql = New-Object System.Collections.Generic.List[string]
    $sql.Add('BEGIN TRANSACTION;')
    $sql.Add('')
    $sql.Add('-- Parse run')
    $sql.Add("INSERT INTO parse_runs (run_kind, status, started_at, finished_at, summary)")
    $sql.Add("VALUES ($(ConvertTo-SqlLiteral $NormalizedPayload.entityType), 'completed', $(ConvertTo-SqlLiteral $fetchedAt), $(ConvertTo-SqlLiteral ((Get-Date).ToUniversalTime().ToString('o'))), $(ConvertTo-SqlLiteral $runSummary));")
    $sql.Add('')

    $sql.Add('-- Source row')
    $sql.Add("INSERT INTO sources (kind, name, url)")
    $sql.Add("VALUES ($(ConvertTo-SqlLiteral $sourceKind), $(ConvertTo-SqlLiteral $sourceName), $(ConvertTo-SqlLiteral $sourceUrl))")
    $sql.Add("ON CONFLICT(url) DO UPDATE SET")
    $sql.Add("  kind = excluded.kind,")
    $sql.Add("  name = excluded.name,")
    $sql.Add("  updated_at = CURRENT_TIMESTAMP;")
    $sql.Add('')
    $sql.Add('-- Source snapshot row')
    $sql.Add("INSERT INTO source_snapshots (source_id, content_hash, fetched_at, storage_key, content_type, byte_length, parse_status)")
    $sql.Add("SELECT id, $(ConvertTo-SqlLiteral $contentHash), $(ConvertTo-SqlLiteral $fetchedAt), $(ConvertTo-SqlLiteral $storageKey), $(ConvertTo-SqlLiteral $contentType), $(ConvertTo-SqlLiteral $byteLength), 'captured'")
    $sql.Add("FROM sources")
    $sql.Add("WHERE url = $(ConvertTo-SqlLiteral $sourceUrl)")
    $sql.Add("  AND NOT EXISTS (")
    $sql.Add("    SELECT 1 FROM source_snapshots s")
    $sql.Add("    WHERE s.source_id = sources.id AND s.content_hash = $(ConvertTo-SqlLiteral $contentHash)")
    $sql.Add("  );")
    $sql.Add('')

    foreach ($item in $items) {
        $slug = $item.Slug
        $name = $item.Name
        $entityType = $item.EntityType
        $summary = $item.Summary
        $sourceHash = if ($item.Source.Hash) { $item.Source.Hash } else { $contentHash }
        $changedInPatch = if ($item.Patch.ChangedIn) { $item.Patch.ChangedIn } else { $null }
        $parseStatus = if ($item.Parse.Status) { $item.Parse.Status } else { 'parsed' }
        $confidence = ($item.Parse.Confidence -as [double])
        if ($null -eq $confidence -or $confidence -eq 0) { $confidence = 0.5 }
        $reviewStatus = if ($confidence -ge 0.9) { 'approved' } else { 'draft' }

        $sql.Add("-- Entity $entityType/$slug")
        $sql.Add("INSERT INTO entities (")
        $sql.Add("  entity_type, slug, name, summary, source_url, source_hash, parse_status, review_status, changed_in_patch, source_id, source_snapshot_id")
        $sql.Add(")")
        $sql.Add("SELECT")
        $sql.Add("  $(ConvertTo-SqlLiteral $entityType),")
        $sql.Add("  $(ConvertTo-SqlLiteral $slug),")
        $sql.Add("  $(ConvertTo-SqlLiteral $name),")
        $sql.Add("  $(ConvertTo-SqlLiteral $summary),")
        $sql.Add("  $(ConvertTo-SqlLiteral $sourceUrl),")
        $sql.Add("  $(ConvertTo-SqlLiteral $sourceHash),")
        $sql.Add("  $(ConvertTo-SqlLiteral $parseStatus),")
        $sql.Add("  $(ConvertTo-SqlLiteral $reviewStatus),")
        $sql.Add("  $(ConvertTo-SqlLiteral $changedInPatch),")
        $sql.Add("  src.id,")
        $sql.Add("  snap.id")
        $sql.Add("FROM sources src")
        $sql.Add("JOIN source_snapshots snap ON snap.source_id = src.id")
        $sql.Add("WHERE src.url = $(ConvertTo-SqlLiteral $sourceUrl)")
        $sql.Add("  AND snap.content_hash = $(ConvertTo-SqlLiteral $contentHash)")
        $sql.Add("ON CONFLICT(entity_type, slug) DO UPDATE SET")
        $sql.Add("  name = excluded.name,")
        $sql.Add("  summary = excluded.summary,")
        $sql.Add("  source_url = excluded.source_url,")
        $sql.Add("  source_hash = excluded.source_hash,")
        $sql.Add("  parse_status = excluded.parse_status,")
        $sql.Add("  review_status = excluded.review_status,")
        $sql.Add("  changed_in_patch = excluded.changed_in_patch,")
        $sql.Add("  source_id = excluded.source_id,")
        $sql.Add("  source_snapshot_id = excluded.source_snapshot_id,")
        $sql.Add("  updated_at = CURRENT_TIMESTAMP;")
        $sql.Add('')

        $sql.Add("DELETE FROM entity_effects")
        $sql.Add("WHERE entity_id = (SELECT id FROM entities WHERE entity_type = $(ConvertTo-SqlLiteral $entityType) AND slug = $(ConvertTo-SqlLiteral $slug));")

        $displayOrder = 0
        foreach ($effect in @($item.Effects)) {
            $effectKey = if ($effect.EffectKey) { $effect.EffectKey } else { $null }
            $effectValue = if ($effect.EffectValue) { $effect.EffectValue } else { $null }
            $effectText = if ($effect.EffectText) { $effect.EffectText } else { [string]$effect }
            $sql.Add("INSERT INTO entity_effects (entity_id, effect_key, effect_value, effect_text, display_order)")
            $sql.Add("SELECT id, $(ConvertTo-SqlLiteral $effectKey), $(ConvertTo-SqlLiteral $effectValue), $(ConvertTo-SqlLiteral $effectText), $displayOrder")
            $sql.Add("FROM entities WHERE entity_type = $(ConvertTo-SqlLiteral $entityType) AND slug = $(ConvertTo-SqlLiteral $slug);")
            $displayOrder++
        }
        $sql.Add('')

        $sql.Add("DELETE FROM entity_requirements")
        $sql.Add("WHERE entity_id = (SELECT id FROM entities WHERE entity_type = $(ConvertTo-SqlLiteral $entityType) AND slug = $(ConvertTo-SqlLiteral $slug));")

        $reqOrder = 0
        foreach ($req in @($item.Requirements)) {
            $text = if ($req.requirement_text) { $req.requirement_text } else { [string]$req }
            $sql.Add("INSERT INTO entity_requirements (entity_id, requirement_type, requirement_text, display_order)")
            $sql.Add("SELECT id, 'requirement', $(ConvertTo-SqlLiteral $text), $reqOrder")
            $sql.Add("FROM entities WHERE entity_type = $(ConvertTo-SqlLiteral $entityType) AND slug = $(ConvertTo-SqlLiteral $slug);")
            $reqOrder++
        }

        foreach ($restriction in @($item.Exclusions)) {
            $text = if ($restriction.requirement_text) { $restriction.requirement_text } else { [string]$restriction }
            $sql.Add("INSERT INTO entity_requirements (entity_id, requirement_type, requirement_text, display_order)")
            $sql.Add("SELECT id, 'restriction', $(ConvertTo-SqlLiteral $text), $reqOrder")
            $sql.Add("FROM entities WHERE entity_type = $(ConvertTo-SqlLiteral $entityType) AND slug = $(ConvertTo-SqlLiteral $slug);")
            $reqOrder++
        }
        $sql.Add('')

        if ($confidence -lt 0.85) {
            $warningText = (@($item.Parse.Warnings) -join ' | ')
            if (-not $warningText) {
                $warningText = 'Low confidence parse'
            }

            $sql.Add("INSERT INTO parse_issues (parse_run_id, entity_type, page_url, severity, code, message, raw_context)")
            $sql.Add("SELECT")
            $sql.Add("  (SELECT id FROM parse_runs ORDER BY id DESC LIMIT 1),")
            $sql.Add("  $(ConvertTo-SqlLiteral $entityType),")
            $sql.Add("  $(ConvertTo-SqlLiteral $item.Source.Url),")
            $sql.Add("  'warning',")
            $sql.Add("  'low_confidence_parse',")
            $sql.Add("  $(ConvertTo-SqlLiteral $warningText),")
            $sql.Add("  $(ConvertTo-SqlLiteral $slug);")
            $sql.Add('')

            $sql.Add("INSERT INTO review_queue (entity_id, snapshot_id, issue_id, review_kind, status)")
            $sql.Add("SELECT")
            $sql.Add("  e.id,")
            $sql.Add("  snap.id,")
            $sql.Add("  issue.id,")
            $sql.Add("  'parse_diff',")
            $sql.Add("  'open'")
            $sql.Add("FROM entities e")
            $sql.Add("JOIN sources src ON src.id = e.source_id")
            $sql.Add("JOIN source_snapshots snap ON snap.source_id = src.id AND snap.content_hash = $(ConvertTo-SqlLiteral $contentHash)")
            $sql.Add("JOIN parse_issues issue ON issue.id = (SELECT id FROM parse_issues ORDER BY id DESC LIMIT 1)")
            $sql.Add("WHERE e.entity_type = $(ConvertTo-SqlLiteral $entityType) AND e.slug = $(ConvertTo-SqlLiteral $slug);")
            $sql.Add('')
        }
    }

    $sql.Add('COMMIT;')
    return ($sql -join [Environment]::NewLine)
}
