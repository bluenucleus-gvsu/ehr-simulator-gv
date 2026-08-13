import { AssessmentToolGuide } from "./flexSheetData";
import { FlexSheetSection } from "./flexSheetSections";

export const ciwaAssessmentGuide: AssessmentToolGuide[] = [
  {
    name: "CIWA-Ar",
    categories: [
      {
        name: "Nausea & Vomitting",
        scoringOptions: [
          { rating: "0", description: "No nausea or vomitting" },
          { rating: "1", description: "Mild nausea with no vomiting" },
          { rating: "4", description: "Intermittent nausea with no vomiting" },
          { rating: "7", description: "Constant nausea, frequent dry heaves and vomiting" }
        ]
      },
      {
        name: "Tremor",
        scoringOptions: [
          { rating: "0", description: "No tremor" },
          { rating: "1", description: "Not visible, but can be felt fingertip to fingertip" },
          { rating: "4", description: "Moderate, with patient's arms extended" },
          { rating: "7", description: "Severe, even with arms not extended" }
        ]
      },
      {
        name: "Paroxysmal Sweats",
        scoringOptions: [
          { rating: "0", description: "No sweat visible" },
          { rating: "1", description: "Barely perceptible sweating, palms moist" },
          { rating: "4", description: "Beads of sweat obvious on forehead" },
          { rating: "7", description: "Drenching sweats" }
        ]
      },
      {
        name: "Anxiety",
        scoringOptions: [
          { rating: "0", description: "No anxiety, at ease" },
          { rating: "1", description: "Mildly anxious" },
          { rating: "4", description: "Moderately anxious, or guarded, so anxiety is inferred" },
          { rating: "7", description: "Equivalent to acute panic states as seen in severe delirium or acute schizophrenic reactions" }
        ]
      },
      {
        name: "Agitation",
        scoringOptions: [
          { rating: "0", description: "Normal activity" },
          { rating: "1", description: "Somewhat more than normal activity" },
          { rating: "4", description: "Moderately fidgety and restless" },
          { rating: "7", description: "Paces back and forth during most of the interview, or constantly thrashes about" }
        ]
      },
      {
        name: "Tactile Disturbances",
        scoringOptions: [
          { rating: "0", description: "None" },
          { rating: "1", description: "Very mild itching, pins and needles, burning, or numbness" },
          { rating: "2", description: "Mild itching, pins and needles, burning, or numbness" },
          { rating: "3", description: "Moderate itching, pins and needles, burning, or numbness" },
          { rating: "4", description: "Moderately severe hallucinations" },
          { rating: "5", description: "Severe hallucinations" },
          { rating: "6", description: "Extremely severe hallucinations" },
          { rating: "7", description: "Continuous hallucinations" }
        ]
      },
      {
        name: "Auditory Disturbances",
        scoringOptions: [
          { rating: "0", description: "Not present" },
          { rating: "1", description: "Very mild harshness or ability to frighten" },
          { rating: "2", description: "Mild harshness or ability to frighten" },
          { rating: "3", description: "Moderate harshness or ability to frighten" },
          { rating: "4", description: "Moderately severe hallucinations" },
          { rating: "5", description: "Severe hallucinations" },
          { rating: "6", description: "Extremely severe hallucinations" },
          { rating: "7", description: "Continuous hallucinations" }
        ]
      },
      {
        name: "Visual Disturbances",
        scoringOptions: [
          { rating: "0", description: "Not present" },
          { rating: "1", description: "Very mild sensitivity" },
          { rating: "2", description: "Mild sensitivity" },
          { rating: "3", description: "Moderate sensitivity" },
          { rating: "4", description: "Moderately severe hallucinations" },
          { rating: "5", description: "Severe hallucinations" },
          { rating: "6", description: "Extremely severe hallucinations" },
          { rating: "7", description: "Continuous hallucinations" }
        ]
      },
      {
        name: "Headache, Fullness in Head",
        scoringOptions: [
          { rating: "0", description: "Not Present" },
          { rating: "1", description: "Very mild" },
          { rating: "2", description: "Mild" },
          { rating: "3", description: "Moderate" },
          { rating: "4", description: "Moderately severe" },
          { rating: "5", description: "Severe" },
          { rating: "6", description: "Very severe" },
          { rating: "7", description: "Extremely severe" }
        ]
      },
      {
        name: "Orientation and Clouding of Sensorium",
        scoringOptions: [
          { rating: "0", description: "Oriented, can do serial additions" },
          { rating: "1", description: "Cannot do serial additions or is uncertain about date" },
          { rating: "2", description: "Disoriented for date by no more than 2 calendar days" },
          { rating: "3", description: "Disoriented for date by more than 2 calendar days" },
          { rating: "4", description: "Disoriented to place or person" }
        ]
      }
    ],
    maxScore: "67",
    interpretations: [
      { result: "Mild", range: "0-9", description: "Minimal symptoms" },
      { result: "Moderate", range: "10-15", description: "Moderate symptoms" },
      { result: "Severe", range: "16+", description: "Severe symptoms requiring medical attention" }
    ]
  }
];

export const morseAssessmentGuide: AssessmentToolGuide[] = [
  {
    name: "Morse Fall Risk",
    categories: [
      {
        name: "History of Falling",
        scoringOptions: [
          { rating: "0", description: "No falls" },
          { rating: "25", description: "Has fallen in past 3 months." }
        ]
      },
      {
        name: "Secondary Diagnosis",
        scoringOptions: [
          { rating: "0", description: "Yes" },
          { rating: "15", description: "No" }
        ]
      },
      {
        name: "Ambulatory Aid",
        scoringOptions: [
          { rating: "0", description: "Bed rest/nurse assist" },
          { rating: "15", description: "Crutches/cane/walker" },
          { rating: "25", description: "Clutches furniture or support" }
        ]
      },
      {
        name: "IV Inserted",
        scoringOptions: [
          { rating: "0", description: "Yes" },
          { rating: "20", description: "No" }
        ]
      },
      {
        name: "Gait/Transferring",
        scoringOptions: [
          { rating: "0", description: "Normal/bedrest/immobile" },
          { rating: "10", description: "Weak" },
          { rating: "20", description: "Impaired" }
        ]
      },
      {
        name: "Mental Status",
        scoringOptions: [
          { rating: "0", description: "Oriented to own ability" },
          { rating: "15", description: "Forgets limitations" }
        ]
      }
    ],
    interpretations: [
      { result: "No Risk", range: "0-24", description: "Minimal symptoms" },
      { result: "Low Risk", range: "25-50", description: "Moderate symptoms" },
      { result: "High Risk", range: "≥51", description: "Severe symptoms requiring medical attention" }
    ]
  }
];

export const bradenAssessmentGuide: AssessmentToolGuide[] = [
  {
    name: "Braden Scale",
    categories: [
      {
        name: "Sensory Perception",
        scoringOptions: [
          { rating: "1", description: "Completely Limited: Unresponsive to painful stimuli; limited ability to feel pain over most of body." },
          { rating: "2", description: "Very Limited: Responds only to painful stimuli; cannot communicate discomfort except by moaning/restlessness; sensory impairment over half of body." },
          { rating: "3", description: "Slightly Limited: Responds to verbal commands but cannot always communicate discomfort or need to be turned; sensory impairment in 1 or 2 extremities." },
          { rating: "4", description: "No Impairment: Responds to verbal commands; no sensory deficit limiting ability to feel or voice pain/discomfort." }
        ]
      },
      {
        name: "Moisture",
        scoringOptions: [
          { rating: "1", description: "Constantly Moist: Skin kept moist almost constantly by perspiration, urine, etc.; dampness detected every time patient is moved or turned." },
          { rating: "2", description: "Very Moist: Skin is often, but not always, moist; linen must be changed at least once a shift." },
          { rating: "3", description: "Occasionally Moist: Skin is occasionally moist, requiring an extra linen change approximately once a day." },
          { rating: "4", description: "Rarely Moist: Skin is usually dry; linen only requires changing at routine intervals." }
        ]
      },
      {
        name: "Activity",
        scoringOptions: [
          { rating: "1", description: "Bedfast: Confined to bed." },
          { rating: "2", description: "Chairfast: Ability to walk severely limited or non-existent; cannot bear own weight and/or must be assisted into chair/wheelchair." },
          { rating: "3", description: "Walks Occasionally: Walks occasionally during day, but for very short distances, with or without assistance; spends majority of each shift in bed or chair." },
          { rating: "4", description: "Walks Frequently: Walks outside the room at least twice a day and inside room at least once every 2 hours during waking hours." }
        ]
      },
      {
        name: "Mobility",
        scoringOptions: [
          { rating: "1", description: "Completely Immobile: Does not make even slight changes in body or extremity position without assistance." },
          { rating: "2", description: "Very Limited: Makes occasional slight changes in body or extremity position but unable to make frequent or significant changes independently." },
          { rating: "3", description: "Slightly Limited: Makes frequent though slight changes in body or extremity position independently." },
          { rating: "4", description: "No Limitations: Makes major and frequent changes in position without assistance." }
        ]
      },
      {
        name: "Nutrition",
        scoringOptions: [
          { rating: "1", description: "Very Poor: Never eats a complete meal; rarely eats more than 1/3 of any food offered; eats 2 servings or less of protein per day; takes fluids poorly; does not take a liquid dietary supplement; OR is NPO and/or maintained on clear liquids or IVs for more than 5 days." },
          { rating: "2", description: "Probably Inadequate: Rarely eats a complete meal and generally eats only about 1/2 of any food offered; protein intake includes only 3 servings of meat or dairy products per day; occasionally will take a dietary supplement; OR receives less than optimum amount of liquid diet or tube feeding." },
          { rating: "3", description: "Adequate: Eats over half of most meals; eats a total of 4 servings of protein each day; occasionally will refuse a meal, but will usually take a supplement if offered; OR is on a tube feeding or TPN regimen which probably meets most of nutritional needs." },
          { rating: "4", description: "Excellent: Eats most of every meal; never refuses a meal; usually eats a total of 4 or more servings of protein per day; occasionally eats between meals; does not require supplementation." }
        ]
      },
      {
        name: "Friction and Shear",
        scoringOptions: [
          { rating: "1", description: "Problem: Requires moderate to maximum assistance in moving; complete lifting without sliding against sheets is impossible; frequently slides down in bed or chair, requiring frequent repositioning with maximum assistance; spasticity, contractures, or agitation lead to almost constant friction." },
          { rating: "2", description: "Potential Problem: Moves feebly or requires minimum assistance; during a move, skin probably slides to some extent against sheets, chair, restraints, or other devices; maintains relatively good position in chair or bed most of the time but occasionally slides down." },
          { rating: "3", description: "No Apparent Problem: Moves in bed and in chair independently and has sufficient muscle strength to lift up completely during move; maintains good position in bed or chair at all times." }
        ]
      }
    ],
    maxScore: "23",
    interpretations: [
      { result: "No Risk", range: "19-23", description: "Patients are unlikely to develop skin breakdown." },
      { result: "Mild Risk", range: "15-18", description: "Patients demonstrate some risk factors for developing bedsores." },
      { result: "Moderate Risk", range: "13-14", description: "Extra attention should be given; consider environmental safety and balance exercises." },
      { result: "High Risk", range: "10-12", description: "Requires additional equipment and frequent repositioning." },
      { result: "Severe Risk", range: "6-9", description: "At very high risk for skin breakdown; frequent monitoring is essential." }
    ]
  }
];

export const painadAssessmentGuide: AssessmentToolGuide[] = [
  {
    name: "PAINAD",
    categories: [
      {
        name: "Breathing (Independent of Vocalization)",
        scoringOptions: [
          { rating: "0", description: "Normal" },
          { rating: "1", description: "Occasional labored breathing, short periods of hyperventilation" },
          { rating: "2", description: "Noisy labored breathing, long periods of hyperventilation, Cheyne-Stokes" }
        ]
      },
      {
        name: "Negative Vocalization",
        scoringOptions: [
          { rating: "0", description: "None" },
          { rating: "1", description: "Occasional moan or groan, low-level speech with a negative or disapproving quality" },
          { rating: "2", description: "Repeated troubled calling out, loud moaning or groaning, crying" }
        ]
      },
      {
        name: "Facial Expression",
        scoringOptions: [
          { rating: "0", description: "Smiling or inexpressive" },
          { rating: "1", description: "Sad, frightened, frown" },
          { rating: "2", description: "Facial grimacing" }
        ]
      },
      {
        name: "Body Language",
        scoringOptions: [
          { rating: "0", description: "Relaxed" },
          { rating: "1", description: "Tense, distressed pacing, fidgeting" },
          { rating: "2", description: "Rigid, fists clenched, knees pulled up or pushing away, striking out" }
        ]
      },
      {
        name: "Consolability",
        scoringOptions: [
          { rating: "0", description: "No need to console" },
          { rating: "1", description: "Distracted or reassured by voice or touch" },
          { rating: "2", description: "Unable to console, distract, or reassure" }
        ]
      }
    ],
    maxScore: "10",
    interpretations: [
      { result: "Mild Pain", range: "1-3", description: "Possible mild discomfort." },
      { result: "Moderate Pain", range: "4-6", description: "Likely moderate pain, consider intervention." },
      { result: "Severe Pain", range: "7-10", description: "Severe pain, requires immediate attention and intervention." }
    ]
  }
];

export type AssessmentToolGuides = Partial<Record<FlexSheetSection, AssessmentToolGuide[]>>;

export const assessmentToolGuides: AssessmentToolGuides = {
  [FlexSheetSection.BRADEN]: bradenAssessmentGuide,
  [FlexSheetSection.CIWA]: ciwaAssessmentGuide,
  [FlexSheetSection.MORSE]: morseAssessmentGuide,
  [FlexSheetSection.PAINAD]: painadAssessmentGuide,
};


// For EHR sidebar - only includes guides for selected Assessment Tools
export function buildAssessmentToolGuide(toolSelections: Set<string>) {
  const baseTemplate = [] as AssessmentToolGuide[];

  for (const [name, guide] of Object.entries(assessmentToolGuides)) {
    if (toolSelections.has(name)) {
      baseTemplate.push(...guide);
    }
  }

  return baseTemplate;
}