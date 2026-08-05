#!/usr/bin/env bash
set -euo pipefail

APP_ID="$1"
BRANCH_NAME="$2"
REGION="$3"
FRONTEND_DIR="$4"

cd "$FRONTEND_DIR"
npm ci
npm run build

ZIP_PATH="$(mktemp -u).zip"
python3 - "$ZIP_PATH" <<'PYEOF'
import os, sys, zipfile

zip_path = sys.argv[1]
with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
    for root, _, files in os.walk("dist"):
        for name in files:
            full = os.path.join(root, name)
            zf.write(full, os.path.relpath(full, "dist"))
PYEOF

DEPLOYMENT=$(aws amplify create-deployment --app-id "$APP_ID" --branch-name "$BRANCH_NAME" --region "$REGION")
JOB_ID=$(echo "$DEPLOYMENT" | python3 -c "import json,sys; print(json.load(sys.stdin)['jobId'])")
UPLOAD_URL=$(echo "$DEPLOYMENT" | python3 -c "import json,sys; print(json.load(sys.stdin)['zipUploadUrl'])")

curl -sf -X PUT -T "$ZIP_PATH" "$UPLOAD_URL"
rm -f "$ZIP_PATH"

aws amplify start-deployment --app-id "$APP_ID" --branch-name "$BRANCH_NAME" --job-id "$JOB_ID" --region "$REGION"
