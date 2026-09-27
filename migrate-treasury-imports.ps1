# migrate-treasury-imports.ps1
# One-time import-path migration for Treasury Layer 2 Phase A.
# Run from the repo root. Safe to re-run: substitutions are idempotent.

$ErrorActionPreference = 'Stop'

$replacements = @(
  @{ From = '@/lib/admin/types/treasury';               To = '@/lib/domains/treasury/types' },
  @{ From = '@/lib/admin/treasury/treasury-constants';  To = '@/lib/domains/treasury/constants' },
  @{ From = '@/lib/admin/treasury/treasury-helpers';    To = '@/lib/domains/treasury/helpers' },
  @{ From = '@/lib/admin/treasury/treasury-labels';     To = '@/lib/domains/treasury/labels' },
  @{ From = '@/lib/admin/treasury/treasury-projection'; To = '@/lib/domains/treasury/projection' },
  @{ From = '@/lib/admin/mock/treasury-store';          To = '@/lib/domains/treasury/store' },
  @{ From = '@/lib/admin/mock/treasury-mutations';      To = '@/lib/domains/treasury/admin-actions' },
  @{ From = '../types/treasury';                        To = '@/lib/domains/treasury/types' },
  @{ From = './treasury-store';                         To = '@/lib/domains/treasury/store' },
  @{ From = './treasury-labels';                        To = '@/lib/domains/treasury/labels' }
)

$files = Get-ChildItem -Recurse -Path src -Include *.ts,*.tsx
$changed = 0

foreach ($file in $files) {
  $relative = $file.FullName.Substring((Get-Location).Path.Length + 1)
  if ($relative -match '^src\\lib\\domains\\treasury\\') { continue }

  $content = Get-Content -Raw -Path $file.FullName
  $original = $content

  foreach ($r in $replacements) {
    $content = $content.Replace($r.From, $r.To)
  }

  if ($content -ne $original) {
    Set-Content -Path $file.FullName -Value $content -NoNewline -Encoding utf8
    Write-Host "updated: $relative"
    $changed++
  }
}

Write-Host ""
Write-Host "Total files changed: $changed"