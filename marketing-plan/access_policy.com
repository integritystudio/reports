// Cloudflare Access policy (via API)
const accessPolicy = {
  "name": "secure-app-access",
  "decision": "allow",
  "include": [
    {
      "email_domain": {
        "domain": "integrityai.com"
      }
    }
  ],
  "session_duration": "24h"
};