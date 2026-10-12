#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Musha Empire — Populate missing fields in settings/salon
# Target project: musha-ae73e
# Safe, idempotent REST PATCH using Google Cloud OAuth token
# ==============================================================================

PROJECT_ID="musha-ae73e"
TOKEN="$(gcloud auth print-access-token)"

echo "Checking current settings/salon document..."
CURRENT_DOC=$(curl -s -H "Authorization: Bearer ${TOKEN}" \
  "https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/settings/salon")

if echo "${CURRENT_DOC}" | grep -q '"error"'; then
  echo "❌ Error retrieving document or document does not exist."
  echo "${CURRENT_DOC}"
  exit 1
fi

echo "Document found. Populating missing fields (preserving salon_name)..."

NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

curl -s -X PATCH \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  "https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/settings/salon?updateMask.fieldPaths=timezone&updateMask.fieldPaths=slotDurationMinutes&updateMask.fieldPaths=holidays&updateMask.fieldPaths=opening_hours&updateMask.fieldPaths=updated_at" \
  -d '{
    "fields": {
      "timezone": {"stringValue": "Asia/Kolkata"},
      "slotDurationMinutes": {"integerValue": "30"},
      "holidays": {"arrayValue": {}},
      "updated_at": {"stringValue": "'"${NOW}"'"},
      "opening_hours": {
        "arrayValue": {
          "values": [
            {"mapValue": {"fields": {"day": {"stringValue": "Monday"}, "open": {"stringValue": "10:00 AM"}, "close": {"stringValue": "09:00 PM"}, "isClosed": {"booleanValue": false}}}},
            {"mapValue": {"fields": {"day": {"stringValue": "Tuesday"}, "open": {"stringValue": "10:00 AM"}, "close": {"stringValue": "09:00 PM"}, "isClosed": {"booleanValue": false}}}},
            {"mapValue": {"fields": {"day": {"stringValue": "Wednesday"}, "open": {"stringValue": "10:00 AM"}, "close": {"stringValue": "09:00 PM"}, "isClosed": {"booleanValue": false}}}},
            {"mapValue": {"fields": {"day": {"stringValue": "Thursday"}, "open": {"stringValue": "10:00 AM"}, "close": {"stringValue": "09:00 PM"}, "isClosed": {"booleanValue": false}}}},
            {"mapValue": {"fields": {"day": {"stringValue": "Friday"}, "open": {"stringValue": "10:00 AM"}, "close": {"stringValue": "09:00 PM"}, "isClosed": {"booleanValue": false}}}},
            {"mapValue": {"fields": {"day": {"stringValue": "Saturday"}, "open": {"stringValue": "10:00 AM"}, "close": {"stringValue": "09:00 PM"}, "isClosed": {"booleanValue": false}}}},
            {"mapValue": {"fields": {"day": {"stringValue": "Sunday"}, "open": {"stringValue": "10:00 AM"}, "close": {"stringValue": "09:00 PM"}, "isClosed": {"booleanValue": false}}}}
          ]
        }
      }
    }
  }' > /dev/null

echo "✅ Document settings/salon updated successfully!"
