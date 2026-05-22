---
{
  "schema": "novel-elf.story-md.v1",
  "kind": "narrative",
  "premise": "A cartographer arrives with a pre-Sundering map, forcing tide-counters, heirs, and old fire cult records to decide which version of Aevenmere is allowed to become true.",
  "themes": [
    "memory as territory",
    "maps as political weapons",
    "inheritance versus chosen duty"
  ],
  "storylines": [
    {
      "id": "line_map",
      "name": "The Map Before the Sundering",
      "role": "main",
      "targetShare": 0.45,
      "povIds": [
        "ch_cart",
        "ch_miorra"
      ],
      "promise": "The map can reveal a version of the Reach that powerful houses need buried.",
      "currentPressure": "Brackhold must decide whether the stranger is a witness, a fraud, or a returning wound.",
      "actShares": [
        {
          "act": "vol_b1",
          "targetShare": 0.62
        },
        {
          "act": "vol_b2",
          "targetShare": 0.35
        }
      ]
    },
    {
      "id": "line_heir",
      "name": "The Half-Sky Inheritance",
      "role": "secondary",
      "targetShare": 0.3,
      "povIds": [
        "ch_edrun"
      ],
      "promise": "Edrun's legitimacy depends on a history the map may disprove.",
      "currentPressure": "A raven and a seal from Brackhold pull him away from Cael Vaer."
    },
    {
      "id": "line_burning",
      "name": "The Burning Years Echo",
      "role": "shadow",
      "targetShare": 0.25,
      "povIds": [
        "ch_veshra"
      ],
      "promise": "The old fires did not end cleanly; their survivors still shape the present.",
      "currentPressure": "Veshra is officially dead, but the map remembers her route through the Wastes."
    }
  ],
  "characterArcs": [
    {
      "characterId": "ch_miorra",
      "want": "Keep the tide-count honest and local.",
      "need": "Accept that Brackhold's truth can change the whole Reach.",
      "lie": "Counting accurately is the same as staying neutral.",
      "arcStage": "called_out_of_witness",
      "nextRequiredBeat": "She must choose whether to hide or repeat the stranger's impossible count."
    },
    {
      "characterId": "ch_edrun",
      "want": "Hold Vaelora together long enough to inherit it.",
      "need": "Admit legitimacy can come from repair rather than blood.",
      "lie": "If the documents are clean, the realm will obey.",
      "arcStage": "protected_by_office",
      "nextRequiredBeat": "He receives evidence that his title rests on a map nobody can authenticate."
    },
    {
      "characterId": "ch_cart",
      "want": "Make the old map believed before its ink changes.",
      "need": "Tell someone what the seventh fold will cost.",
      "lie": "A correct map can save people without asking them to choose.",
      "arcStage": "withholding_the_cost",
      "nextRequiredBeat": "She lets Miorra see one fold that should be blank."
    }
  ],
  "openLoops": [
    {
      "id": "loop_seventh_fold",
      "raisedIn": "ch_b1_1",
      "question": "What appears on the map's seventh fold?",
      "importance": "major",
      "targetPayoff": "vol_b1",
      "status": "active"
    },
    {
      "id": "loop_raven_seal",
      "raisedIn": "ch_b2_1",
      "question": "Why does Threa's seal matter to Edrun?",
      "importance": "major",
      "targetPayoff": "vol_b2",
      "status": "active"
    },
    {
      "id": "loop_veshra_route",
      "raisedIn": "ch_burn_1_1",
      "question": "How did Veshra leave a route on a map made before her life?",
      "importance": "shadow",
      "targetPayoff": "bk_burning",
      "status": "active"
    }
  ],
  "style": {
    "narration": "close third, restrained, image-led",
    "tense": "present",
    "sentenceRhythm": "short pressure sentences during discovery; longer tactile sentences during aftermath",
    "sensoryPriority": [
      "touch",
      "sound",
      "smell"
    ],
    "metaphorRules": "Metaphors should come from tide, slate, vellum, coal, salt, brass, debt, wet stone.",
    "avoid": [
      "chosen one phrasing",
      "generic prophecy language",
      "ancient evil",
      "purple mist",
      "destiny declares"
    ],
    "dialogue": "status-aware and indirect; characters rarely name the actual wound aloud"
  },
  "savedAt": "2026-05-22T00:00:00.000Z"
}
---
# Narrative Blueprint

Aevenmere's AI-facing structure: storylines, viewpoint balance, open loops, character arcs, and style rules.
