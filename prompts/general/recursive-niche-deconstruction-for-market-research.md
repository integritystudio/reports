# Recursive Niche Deconstruction for Market Research

**Category:** General
**For Developers:** False
**Contributor:** amvicioushecs
**Type:** STRUCTURED

## Prompt

{
  "industry": "${industry}",
  "region": "${region}",
  "tree": {
    "level": "Macro",
    "name": "...",
    "market_valuation": "$X",
    "top_players": [
      {
        "name": "Company A",
        "type": "Incumbent",
        "focus": "Broad"
      },
      {
        "name": "Company B",
        "type": "Incumbent",
        "focus": "Broad"
      }
    ],
    "children": [
      {
        "level": "Sub-Niche/Micro",
        "name": "...",
        "narrowing_variable": "...",
        "market_valuation": "$X",
        "top_players": [
          {
            "name": "Startup C",
            "type": "Specialist",
            "focus": "Verticalized"
          },
          {
            "name": "Tool D",
            "type": "Micro-SaaS",
            "focus": "Hyper-Specific"
          }
        ],
        "children": []
      }
    ]
  },
  "keyword_analysis": {
    "monthly_traffic": "{region-specific traffic data}",
    "competitiveness": "{region-specific competitiveness data}",
    "potential_keywords": [
      {
        "keyword": "...",
        "traffic": "...",
        "competition": "..."
      }
    ]
  }
}

---
*Source: [prompts.chat](https://prompts.chat) | License: CC0 1.0 (Public Domain)*
