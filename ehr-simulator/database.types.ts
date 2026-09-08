export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      case_family_history: {
        Row: {
          case_id: string
          condition: string
          created_at: string | null
          id: string
          relationship_id: string
        }
        Insert: {
          case_id: string
          condition: string
          created_at?: string | null
          id?: string
          relationship_id: string
        }
        Update: {
          case_id?: string
          condition?: string
          created_at?: string | null
          id?: string
          relationship_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_family_history_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_family_history_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationship_types"
            referencedColumns: ["id"]
          },
        ]
      }
      case_images: {
        Row: {
          case_id: string | null
          created_at: string | null
          file_path: string | null
          id: string
          preview_url: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string | null
          file_path?: string | null
          id?: string
          preview_url: string
        }
        Update: {
          case_id?: string | null
          created_at?: string | null
          file_path?: string | null
          id?: string
          preview_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_images_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_safety_alerts: {
        Row: {
          case_id: string
          created_at: string
          safety_alert_id: string
        }
        Insert: {
          case_id: string
          created_at?: string
          safety_alert_id: string
        }
        Update: {
          case_id?: string
          created_at?: string
          safety_alert_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_safety_alerts_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_safety_alerts_safety_alert_id_fkey"
            columns: ["safety_alert_id"]
            isOneToOne: false
            referencedRelation: "safety_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      case_sessions: {
        Row: {
          case_id: string | null
          completed_at: string | null
          current_phase: number
          feedback: string | null
          group_id: string | null
          id: string
          section_assignment_id: string | null
          started_at: string | null
          status: string | null
          student_ids: string | null
        }
        Insert: {
          case_id?: string | null
          completed_at?: string | null
          current_phase?: number
          feedback?: string | null
          group_id?: string | null
          id?: string
          section_assignment_id?: string | null
          started_at?: string | null
          status?: string | null
          student_ids?: string | null
        }
        Update: {
          case_id?: string | null
          completed_at?: string | null
          current_phase?: number
          feedback?: string | null
          group_id?: string | null
          id?: string
          section_assignment_id?: string | null
          started_at?: string | null
          status?: string | null
          student_ids?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_sessions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_sessions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_sessions_section_assignment_id_fkey"
            columns: ["section_assignment_id"]
            isOneToOne: false
            referencedRelation: "section_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          admitting_diagnosis: string | null
          age: number | null
          allergies: string[] | null
          attending_provider: string | null
<<<<<<< HEAD
          case_specialty: Database["public"]["Enums"]["case_specialty_type"]
=======
>>>>>>> 3388220 (update lab_result schema)
          code_status: Database["public"]["Enums"]["code_status_type"]
          created_at: string | null
          description: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          employment: string | null
          first_name: string
          flexsheet_sections:
            | Database["public"]["Enums"]["flexsheet_section_type"][]
            | null
          height_ft: number | null
          height_in: number | null
          id: string
          insurance: Database["public"]["Enums"]["insurance_type"] | null
          intake_output_blocks: Json
          isolation_precautions_id: string | null
          language: string | null
          last_name: string
          living_situation: string[] | null
          medical_history: string[] | null
          mrn: number
          name: string
          phase_count: number
          relationship_status_id: string | null
          religion: string | null
          requires_interpreter: boolean
          social_habits: string[] | null
          surgical_history: string[] | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          admitting_diagnosis?: string | null
          age?: number | null
          allergies?: string[] | null
          attending_provider?: string | null
<<<<<<< HEAD
          case_specialty: Database["public"]["Enums"]["case_specialty_type"]
=======
>>>>>>> 3388220 (update lab_result schema)
          code_status: Database["public"]["Enums"]["code_status_type"]
          created_at?: string | null
          description?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          employment?: string | null
          first_name: string
          flexsheet_sections?:
            | Database["public"]["Enums"]["flexsheet_section_type"][]
            | null
          height_ft?: number | null
          height_in?: number | null
          id?: string
          insurance?: Database["public"]["Enums"]["insurance_type"] | null
          intake_output_blocks?: Json
          isolation_precautions_id?: string | null
          language?: string | null
          last_name: string
          living_situation?: string[] | null
          medical_history?: string[] | null
          mrn?: never
          name: string
          phase_count?: number
          relationship_status_id?: string | null
          religion?: string | null
          requires_interpreter?: boolean
          social_habits?: string[] | null
          surgical_history?: string[] | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          admitting_diagnosis?: string | null
          age?: number | null
          allergies?: string[] | null
          attending_provider?: string | null
<<<<<<< HEAD
          case_specialty?: Database["public"]["Enums"]["case_specialty_type"]
=======
>>>>>>> 3388220 (update lab_result schema)
          code_status?: Database["public"]["Enums"]["code_status_type"]
          created_at?: string | null
          description?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          employment?: string | null
          first_name?: string
          flexsheet_sections?:
            | Database["public"]["Enums"]["flexsheet_section_type"][]
            | null
          height_ft?: number | null
          height_in?: number | null
          id?: string
          insurance?: Database["public"]["Enums"]["insurance_type"] | null
          intake_output_blocks?: Json
          isolation_precautions_id?: string | null
          language?: string | null
          last_name?: string
          living_situation?: string[] | null
          medical_history?: string[] | null
          mrn?: never
          name?: string
          phase_count?: number
          relationship_status_id?: string | null
          religion?: string | null
          requires_interpreter?: boolean
          social_habits?: string[] | null
          surgical_history?: string[] | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_isolation_precautions_id_fkey"
            columns: ["isolation_precautions_id"]
            isOneToOne: false
            referencedRelation: "isolation_precautions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_relationship_status_id_fkey"
            columns: ["relationship_status_id"]
            isOneToOne: false
            referencedRelation: "relationship_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      cases_json_blobs: {
        Row: {
          created_at: string
          id: string
          payload: Json
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          payload?: Json
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      clinical_documents: {
        Row: {
          author: string
          case_id: string
          category: Database["public"]["Enums"]["clinical_doc_category_type"]
          created_at: string | null
          doc_text: string
          id: string
          is_in_presim: boolean
          phase: number
          specialty: string
          time_offset: number
        }
        Insert: {
          author: string
          case_id: string
          category: Database["public"]["Enums"]["clinical_doc_category_type"]
          created_at?: string | null
          doc_text: string
          id?: string
          is_in_presim?: boolean
          phase?: number
          specialty: string
          time_offset: number
        }
        Update: {
          author?: string
          case_id?: string
          category?: Database["public"]["Enums"]["clinical_doc_category_type"]
          created_at?: string | null
          doc_text?: string
          id?: string
          is_in_presim?: boolean
          phase?: number
          specialty?: string
          time_offset?: number
        }
        Relationships: [
          {
            foreignKeyName: "clinical_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      course_cases: {
        Row: {
          case_id: string | null
          course_id: string | null
          created_at: string | null
          id: string
        }
        Insert: {
          case_id?: string | null
          course_id?: string | null
          created_at?: string | null
          id?: string
        }
        Update: {
          case_id?: string | null
          course_id?: string | null
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_cases_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_cases_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          active: boolean | null
          code: string
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      dispense_units: {
        Row: {
          description: string | null
          id: number
          name: string
        }
        Insert: {
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      documentation_results: {
        Row: {
          abdomen: string | null
          appearance: string | null
          assessment_tool_selections: string | null
          bowel_sounds: string | null
          bp: string | null
          bp_position: string | null
          bp_source: string | null
          braden_activity: string | null
          braden_friction_and_shear: string | null
          braden_mobility: string | null
          braden_moisture: string | null
          braden_nutrition: string | null
          braden_sensory_perception: string | null
          cardiac_extremities: string | null
          cardiovascular_selections: string | null
          case_id: string
          chest_appearance: string | null
          ciwa_agitation: string | null
          ciwa_anxiety: string | null
          ciwa_headache: string | null
          ciwa_nausea_vomiting: string | null
          ciwa_orientation: string | null
          ciwa_sweats: string | null
          ciwa_tactile: string | null
          ciwa_tremor: string | null
          ciwa_visual: string | null
          created_at: string
          ears: string | null
          emesis_occurrence: string | null
          emesis_output_ml: string | null
          enteral_intake_ml: string | null
          enteral_output_ml: string | null
          extremity_rom: string | null
          eyes: string | null
          faces_pain_scale: string | null
          gait: string | null
          general_appearance_selections: string | null
          genitourinary_selections: string | null
          gi_selections: string | null
          gi_symptoms: string | null
          hair_and_nails: string | null
          head_and_scalp: string | null
          heart_sounds: string | null
          heent_selections: string | null
          hr: string | null
          hr_source: string | null
          id: string
          intake_selections: string | null
          integument_selections: string | null
          is_in_presim: boolean
          iv_intake_ml: string | null
          iv_location_1: string | null
          iv_location_2: string | null
          iv_site_1: string | null
          iv_site_2: string | null
          iv_type_1: string | null
          iv_type_2: string | null
          jugular_distention: string | null
          level_of_consciousness: string | null
          lung_sounds: string | null
          mean_arterial_pressure: string | null
          mental_status: string | null
          mood_and_affect: string | null
          morse_ambulatory_aid: string | null
          morse_fall_history: string | null
          morse_gait: string | null
          morse_iv: string | null
          morse_mental_status: string | null
          morse_secondary_diagnosis: string | null
          motor_function: string | null
          mouth_and_throat: string | null
          muscle_strength: string | null
          musculoskeletal_selections: string | null
          neuro_selections: string | null
          neuro_sensation: string | null
          nose: string | null
          nursing_care_provided: string | null
          oral_intake_ml: string | null
          orientation: string | null
          output_selections: string | null
          oxygen_device: string | null
<<<<<<< HEAD
=======
          pain: string | null
>>>>>>> 3388220 (update lab_result schema)
          pain_aggravating_factors: string | null
          pain_alleviating_factors: string | null
          pain_characteristics: string | null
          pain_interventions: string | null
          pain_location: string | null
          pain_numeric_scale: string | null
          painad_body_language: string | null
          painad_breathing: string | null
          painad_consolability: string | null
          painad_facial_expression: string | null
          painad_negative_vocalization: string | null
          parenteral_intake_ml: string | null
          periwound_skin: string | null
          primary_wound_dressing: string | null
          psychosocial_selections: string | null
          pupils: string | null
          respiratory_selections: string | null
          rr: string | null
          safety_check: string | null
          secondary_wound_dressing: string | null
          skin: string | null
          speech: string | null
          spo2: string | null
<<<<<<< HEAD
          stool_occurrence: string | null
          stool_output_ml: string | null
          supplemental_o2_rate: string | null
=======
          stool: string | null
          supplemental_o2_rate: string | null
          tactile_disturbances: number | null
>>>>>>> 3388220 (update lab_result schema)
          temp: string | null
          temp_source: string | null
          time_offset: number
          turgor: string | null
          urine_description: string | null
          urine_occurrence: string | null
          urine_output_ml: string | null
          voiding: string | null
          weight_kg: string | null
          wound: string | null
          wound_bed: string | null
          wound_dimensions: string | null
          wound_exudate: string | null
          wound_location: string | null
          wound_output_ml: string | null
          wound_stage: string | null
          wound_type: string | null
        }
        Insert: {
          abdomen?: string | null
          appearance?: string | null
          assessment_tool_selections?: string | null
          bowel_sounds?: string | null
          bp?: string | null
          bp_position?: string | null
          bp_source?: string | null
          braden_activity?: string | null
          braden_friction_and_shear?: string | null
          braden_mobility?: string | null
          braden_moisture?: string | null
          braden_nutrition?: string | null
          braden_sensory_perception?: string | null
          cardiac_extremities?: string | null
          cardiovascular_selections?: string | null
          case_id: string
          chest_appearance?: string | null
          ciwa_agitation?: string | null
          ciwa_anxiety?: string | null
          ciwa_headache?: string | null
          ciwa_nausea_vomiting?: string | null
          ciwa_orientation?: string | null
          ciwa_sweats?: string | null
          ciwa_tactile?: string | null
          ciwa_tremor?: string | null
          ciwa_visual?: string | null
          created_at?: string
          ears?: string | null
          emesis_occurrence?: string | null
          emesis_output_ml?: string | null
          enteral_intake_ml?: string | null
          enteral_output_ml?: string | null
          extremity_rom?: string | null
          eyes?: string | null
          faces_pain_scale?: string | null
          gait?: string | null
          general_appearance_selections?: string | null
          genitourinary_selections?: string | null
          gi_selections?: string | null
          gi_symptoms?: string | null
          hair_and_nails?: string | null
          head_and_scalp?: string | null
          heart_sounds?: string | null
          heent_selections?: string | null
          hr?: string | null
          hr_source?: string | null
          id?: string
          intake_selections?: string | null
          integument_selections?: string | null
          is_in_presim?: boolean
          iv_intake_ml?: string | null
          iv_location_1?: string | null
          iv_location_2?: string | null
          iv_site_1?: string | null
          iv_site_2?: string | null
          iv_type_1?: string | null
          iv_type_2?: string | null
          jugular_distention?: string | null
          level_of_consciousness?: string | null
          lung_sounds?: string | null
          mean_arterial_pressure?: string | null
          mental_status?: string | null
          mood_and_affect?: string | null
          morse_ambulatory_aid?: string | null
          morse_fall_history?: string | null
          morse_gait?: string | null
          morse_iv?: string | null
          morse_mental_status?: string | null
          morse_secondary_diagnosis?: string | null
          motor_function?: string | null
          mouth_and_throat?: string | null
          muscle_strength?: string | null
          musculoskeletal_selections?: string | null
          neuro_selections?: string | null
          neuro_sensation?: string | null
          nose?: string | null
          nursing_care_provided?: string | null
          oral_intake_ml?: string | null
          orientation?: string | null
          output_selections?: string | null
          oxygen_device?: string | null
<<<<<<< HEAD
=======
          pain?: string | null
>>>>>>> 3388220 (update lab_result schema)
          pain_aggravating_factors?: string | null
          pain_alleviating_factors?: string | null
          pain_characteristics?: string | null
          pain_interventions?: string | null
          pain_location?: string | null
          pain_numeric_scale?: string | null
          painad_body_language?: string | null
          painad_breathing?: string | null
          painad_consolability?: string | null
          painad_facial_expression?: string | null
          painad_negative_vocalization?: string | null
          parenteral_intake_ml?: string | null
          periwound_skin?: string | null
          primary_wound_dressing?: string | null
          psychosocial_selections?: string | null
          pupils?: string | null
          respiratory_selections?: string | null
          rr?: string | null
          safety_check?: string | null
          secondary_wound_dressing?: string | null
          skin?: string | null
          speech?: string | null
          spo2?: string | null
<<<<<<< HEAD
          stool_occurrence?: string | null
          stool_output_ml?: string | null
          supplemental_o2_rate?: string | null
=======
          stool?: string | null
          supplemental_o2_rate?: string | null
          tactile_disturbances?: number | null
>>>>>>> 3388220 (update lab_result schema)
          temp?: string | null
          temp_source?: string | null
          time_offset: number
          turgor?: string | null
          urine_description?: string | null
          urine_occurrence?: string | null
          urine_output_ml?: string | null
          voiding?: string | null
          weight_kg?: string | null
          wound?: string | null
          wound_bed?: string | null
          wound_dimensions?: string | null
          wound_exudate?: string | null
          wound_location?: string | null
          wound_output_ml?: string | null
          wound_stage?: string | null
          wound_type?: string | null
        }
        Update: {
          abdomen?: string | null
          appearance?: string | null
          assessment_tool_selections?: string | null
          bowel_sounds?: string | null
          bp?: string | null
          bp_position?: string | null
          bp_source?: string | null
          braden_activity?: string | null
          braden_friction_and_shear?: string | null
          braden_mobility?: string | null
          braden_moisture?: string | null
          braden_nutrition?: string | null
          braden_sensory_perception?: string | null
          cardiac_extremities?: string | null
          cardiovascular_selections?: string | null
          case_id?: string
          chest_appearance?: string | null
          ciwa_agitation?: string | null
          ciwa_anxiety?: string | null
          ciwa_headache?: string | null
          ciwa_nausea_vomiting?: string | null
          ciwa_orientation?: string | null
          ciwa_sweats?: string | null
          ciwa_tactile?: string | null
          ciwa_tremor?: string | null
          ciwa_visual?: string | null
          created_at?: string
          ears?: string | null
          emesis_occurrence?: string | null
          emesis_output_ml?: string | null
          enteral_intake_ml?: string | null
          enteral_output_ml?: string | null
          extremity_rom?: string | null
          eyes?: string | null
          faces_pain_scale?: string | null
          gait?: string | null
          general_appearance_selections?: string | null
          genitourinary_selections?: string | null
          gi_selections?: string | null
          gi_symptoms?: string | null
          hair_and_nails?: string | null
          head_and_scalp?: string | null
          heart_sounds?: string | null
          heent_selections?: string | null
          hr?: string | null
          hr_source?: string | null
          id?: string
          intake_selections?: string | null
          integument_selections?: string | null
          is_in_presim?: boolean
          iv_intake_ml?: string | null
          iv_location_1?: string | null
          iv_location_2?: string | null
          iv_site_1?: string | null
          iv_site_2?: string | null
          iv_type_1?: string | null
          iv_type_2?: string | null
          jugular_distention?: string | null
          level_of_consciousness?: string | null
          lung_sounds?: string | null
          mean_arterial_pressure?: string | null
          mental_status?: string | null
          mood_and_affect?: string | null
          morse_ambulatory_aid?: string | null
          morse_fall_history?: string | null
          morse_gait?: string | null
          morse_iv?: string | null
          morse_mental_status?: string | null
          morse_secondary_diagnosis?: string | null
          motor_function?: string | null
          mouth_and_throat?: string | null
          muscle_strength?: string | null
          musculoskeletal_selections?: string | null
          neuro_selections?: string | null
          neuro_sensation?: string | null
          nose?: string | null
          nursing_care_provided?: string | null
          oral_intake_ml?: string | null
          orientation?: string | null
          output_selections?: string | null
          oxygen_device?: string | null
<<<<<<< HEAD
=======
          pain?: string | null
>>>>>>> 3388220 (update lab_result schema)
          pain_aggravating_factors?: string | null
          pain_alleviating_factors?: string | null
          pain_characteristics?: string | null
          pain_interventions?: string | null
          pain_location?: string | null
          pain_numeric_scale?: string | null
          painad_body_language?: string | null
          painad_breathing?: string | null
          painad_consolability?: string | null
          painad_facial_expression?: string | null
          painad_negative_vocalization?: string | null
          parenteral_intake_ml?: string | null
          periwound_skin?: string | null
          primary_wound_dressing?: string | null
          psychosocial_selections?: string | null
          pupils?: string | null
          respiratory_selections?: string | null
          rr?: string | null
          safety_check?: string | null
          secondary_wound_dressing?: string | null
          skin?: string | null
          speech?: string | null
          spo2?: string | null
<<<<<<< HEAD
          stool_occurrence?: string | null
          stool_output_ml?: string | null
          supplemental_o2_rate?: string | null
=======
          stool?: string | null
          supplemental_o2_rate?: string | null
          tactile_disturbances?: number | null
>>>>>>> 3388220 (update lab_result schema)
          temp?: string | null
          temp_source?: string | null
          time_offset?: number
          turgor?: string | null
          urine_description?: string | null
          urine_occurrence?: string | null
          urine_output_ml?: string | null
          voiding?: string | null
          weight_kg?: string | null
          wound?: string | null
          wound_bed?: string | null
          wound_dimensions?: string | null
          wound_exudate?: string | null
          wound_location?: string | null
          wound_output_ml?: string | null
          wound_stage?: string | null
          wound_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documentation_results_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      editable_clinical_documents: {
        Row: {
          author: string
          case_id: string
          case_session_id: string
          category: Database["public"]["Enums"]["clinical_doc_category_type"]
          created_at: string | null
          doc_text: string
          group_id: string
          id: string
          is_in_presim: boolean
          specialty: string
          time_offset: number
          user_id: string
        }
        Insert: {
          author: string
          case_id: string
          case_session_id: string
          category: Database["public"]["Enums"]["clinical_doc_category_type"]
          created_at?: string | null
          doc_text: string
          group_id: string
          id?: string
          is_in_presim?: boolean
          specialty: string
          time_offset: number
          user_id: string
        }
        Update: {
          author?: string
          case_id?: string
          case_session_id?: string
          category?: Database["public"]["Enums"]["clinical_doc_category_type"]
          created_at?: string | null
          doc_text?: string
          group_id?: string
          id?: string
          is_in_presim?: boolean
          specialty?: string
          time_offset?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "editable_clinical_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "editable_clinical_documents_case_session_id_fkey"
            columns: ["case_session_id"]
            isOneToOne: false
            referencedRelation: "case_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "editable_clinical_documents_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "editable_clinical_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      editable_documentation_results: {
        Row: {
          abdomen: string | null
          appearance: string | null
          assessment_tool_selections: string | null
          bowel_sounds: string | null
          bp: string | null
          bp_position: string | null
          bp_source: string | null
          braden_activity: string | null
          braden_friction_and_shear: string | null
          braden_mobility: string | null
          braden_moisture: string | null
          braden_nutrition: string | null
          braden_sensory_perception: string | null
          cardiac_extremities: string | null
          cardiovascular_selections: string | null
          case_id: string
          case_session_id: string
          chest_appearance: string | null
          ciwa_agitation: string | null
          ciwa_anxiety: string | null
          ciwa_headache: string | null
          ciwa_nausea_vomiting: string | null
          ciwa_orientation: string | null
          ciwa_sweats: string | null
          ciwa_tactile: string | null
          ciwa_tremor: string | null
          ciwa_visual: string | null
          created_at: string
          ears: string | null
          emesis_occurrence: string | null
          emesis_output_ml: string | null
          enteral_intake_ml: string | null
          enteral_output_ml: string | null
          extremity_rom: string | null
          eyes: string | null
          faces_pain_scale: string | null
          gait: string | null
          general_appearance_selections: string | null
          genitourinary_selections: string | null
          gi_selections: string | null
          gi_symptoms: string | null
          group_id: string
          hair_and_nails: string | null
          head_and_scalp: string | null
          heart_sounds: string | null
          heent_selections: string | null
          hr: string | null
          hr_source: string | null
          id: string
          intake_selections: string | null
          integument_selections: string | null
          is_in_presim: boolean
          iv_intake_ml: string | null
          iv_location_1: string | null
          iv_location_2: string | null
          iv_site_1: string | null
          iv_site_2: string | null
          iv_type_1: string | null
          iv_type_2: string | null
          jugular_distention: string | null
          level_of_consciousness: string | null
          lung_sounds: string | null
          mean_arterial_pressure: string | null
          mental_status: string | null
          mood_and_affect: string | null
          morse_ambulatory_aid: string | null
          morse_fall_history: string | null
          morse_gait: string | null
          morse_iv: string | null
          morse_mental_status: string | null
          morse_secondary_diagnosis: string | null
          motor_function: string | null
          mouth_and_throat: string | null
          muscle_strength: string | null
          musculoskeletal_selections: string | null
          neuro_selections: string | null
          neuro_sensation: string | null
          nose: string | null
          nursing_care_provided: string | null
          oral_intake_ml: string | null
          orientation: string | null
          output_selections: string | null
          oxygen_device: string | null
<<<<<<< HEAD
=======
          pain: string | null
>>>>>>> 3388220 (update lab_result schema)
          pain_aggravating_factors: string | null
          pain_alleviating_factors: string | null
          pain_characteristics: string | null
          pain_interventions: string | null
          pain_location: string | null
          pain_numeric_scale: string | null
          painad_body_language: string | null
          painad_breathing: string | null
          painad_consolability: string | null
          painad_facial_expression: string | null
          painad_negative_vocalization: string | null
          parenteral_intake_ml: string | null
          periwound_skin: string | null
          primary_wound_dressing: string | null
          psychosocial_selections: string | null
          pupils: string | null
          respiratory_selections: string | null
          rr: string | null
          safety_check: string | null
          secondary_wound_dressing: string | null
          skin: string | null
          speech: string | null
          spo2: string | null
<<<<<<< HEAD
          stool_occurrence: string | null
          stool_output_ml: string | null
          supplemental_o2_rate: string | null
=======
          stool: string | null
          supplemental_o2_rate: string | null
          tactile_disturbances: number | null
>>>>>>> 3388220 (update lab_result schema)
          temp: string | null
          temp_source: string | null
          time_offset: number
          turgor: string | null
          urine_description: string | null
          urine_occurrence: string | null
          urine_output_ml: string | null
          user_id: string
          voiding: string | null
          weight_kg: string | null
          wound: string | null
          wound_bed: string | null
          wound_dimensions: string | null
          wound_exudate: string | null
          wound_location: string | null
          wound_output_ml: string | null
          wound_stage: string | null
          wound_type: string | null
        }
        Insert: {
          abdomen?: string | null
          appearance?: string | null
          assessment_tool_selections?: string | null
          bowel_sounds?: string | null
          bp?: string | null
          bp_position?: string | null
          bp_source?: string | null
          braden_activity?: string | null
          braden_friction_and_shear?: string | null
          braden_mobility?: string | null
          braden_moisture?: string | null
          braden_nutrition?: string | null
          braden_sensory_perception?: string | null
          cardiac_extremities?: string | null
          cardiovascular_selections?: string | null
          case_id: string
          case_session_id: string
          chest_appearance?: string | null
          ciwa_agitation?: string | null
          ciwa_anxiety?: string | null
          ciwa_headache?: string | null
          ciwa_nausea_vomiting?: string | null
          ciwa_orientation?: string | null
          ciwa_sweats?: string | null
          ciwa_tactile?: string | null
          ciwa_tremor?: string | null
          ciwa_visual?: string | null
          created_at?: string
          ears?: string | null
          emesis_occurrence?: string | null
          emesis_output_ml?: string | null
          enteral_intake_ml?: string | null
          enteral_output_ml?: string | null
          extremity_rom?: string | null
          eyes?: string | null
          faces_pain_scale?: string | null
          gait?: string | null
          general_appearance_selections?: string | null
          genitourinary_selections?: string | null
          gi_selections?: string | null
          gi_symptoms?: string | null
          group_id: string
          hair_and_nails?: string | null
          head_and_scalp?: string | null
          heart_sounds?: string | null
          heent_selections?: string | null
          hr?: string | null
          hr_source?: string | null
          id?: string
          intake_selections?: string | null
          integument_selections?: string | null
          is_in_presim?: boolean
          iv_intake_ml?: string | null
          iv_location_1?: string | null
          iv_location_2?: string | null
          iv_site_1?: string | null
          iv_site_2?: string | null
          iv_type_1?: string | null
          iv_type_2?: string | null
          jugular_distention?: string | null
          level_of_consciousness?: string | null
          lung_sounds?: string | null
          mean_arterial_pressure?: string | null
          mental_status?: string | null
          mood_and_affect?: string | null
          morse_ambulatory_aid?: string | null
          morse_fall_history?: string | null
          morse_gait?: string | null
          morse_iv?: string | null
          morse_mental_status?: string | null
          morse_secondary_diagnosis?: string | null
          motor_function?: string | null
          mouth_and_throat?: string | null
          muscle_strength?: string | null
          musculoskeletal_selections?: string | null
          neuro_selections?: string | null
          neuro_sensation?: string | null
          nose?: string | null
          nursing_care_provided?: string | null
          oral_intake_ml?: string | null
          orientation?: string | null
          output_selections?: string | null
          oxygen_device?: string | null
<<<<<<< HEAD
=======
          pain?: string | null
>>>>>>> 3388220 (update lab_result schema)
          pain_aggravating_factors?: string | null
          pain_alleviating_factors?: string | null
          pain_characteristics?: string | null
          pain_interventions?: string | null
          pain_location?: string | null
          pain_numeric_scale?: string | null
          painad_body_language?: string | null
          painad_breathing?: string | null
          painad_consolability?: string | null
          painad_facial_expression?: string | null
          painad_negative_vocalization?: string | null
          parenteral_intake_ml?: string | null
          periwound_skin?: string | null
          primary_wound_dressing?: string | null
          psychosocial_selections?: string | null
          pupils?: string | null
          respiratory_selections?: string | null
          rr?: string | null
          safety_check?: string | null
          secondary_wound_dressing?: string | null
          skin?: string | null
          speech?: string | null
          spo2?: string | null
<<<<<<< HEAD
          stool_occurrence?: string | null
          stool_output_ml?: string | null
          supplemental_o2_rate?: string | null
=======
          stool?: string | null
          supplemental_o2_rate?: string | null
          tactile_disturbances?: number | null
>>>>>>> 3388220 (update lab_result schema)
          temp?: string | null
          temp_source?: string | null
          time_offset: number
          turgor?: string | null
          urine_description?: string | null
          urine_occurrence?: string | null
          urine_output_ml?: string | null
          user_id: string
          voiding?: string | null
          weight_kg?: string | null
          wound?: string | null
          wound_bed?: string | null
          wound_dimensions?: string | null
          wound_exudate?: string | null
          wound_location?: string | null
          wound_output_ml?: string | null
          wound_stage?: string | null
          wound_type?: string | null
        }
        Update: {
          abdomen?: string | null
          appearance?: string | null
          assessment_tool_selections?: string | null
          bowel_sounds?: string | null
          bp?: string | null
          bp_position?: string | null
          bp_source?: string | null
          braden_activity?: string | null
          braden_friction_and_shear?: string | null
          braden_mobility?: string | null
          braden_moisture?: string | null
          braden_nutrition?: string | null
          braden_sensory_perception?: string | null
          cardiac_extremities?: string | null
          cardiovascular_selections?: string | null
          case_id?: string
          case_session_id?: string
          chest_appearance?: string | null
          ciwa_agitation?: string | null
          ciwa_anxiety?: string | null
          ciwa_headache?: string | null
          ciwa_nausea_vomiting?: string | null
          ciwa_orientation?: string | null
          ciwa_sweats?: string | null
          ciwa_tactile?: string | null
          ciwa_tremor?: string | null
          ciwa_visual?: string | null
          created_at?: string
          ears?: string | null
          emesis_occurrence?: string | null
          emesis_output_ml?: string | null
          enteral_intake_ml?: string | null
          enteral_output_ml?: string | null
          extremity_rom?: string | null
          eyes?: string | null
          faces_pain_scale?: string | null
          gait?: string | null
          general_appearance_selections?: string | null
          genitourinary_selections?: string | null
          gi_selections?: string | null
          gi_symptoms?: string | null
          group_id?: string
          hair_and_nails?: string | null
          head_and_scalp?: string | null
          heart_sounds?: string | null
          heent_selections?: string | null
          hr?: string | null
          hr_source?: string | null
          id?: string
          intake_selections?: string | null
          integument_selections?: string | null
          is_in_presim?: boolean
          iv_intake_ml?: string | null
          iv_location_1?: string | null
          iv_location_2?: string | null
          iv_site_1?: string | null
          iv_site_2?: string | null
          iv_type_1?: string | null
          iv_type_2?: string | null
          jugular_distention?: string | null
          level_of_consciousness?: string | null
          lung_sounds?: string | null
          mean_arterial_pressure?: string | null
          mental_status?: string | null
          mood_and_affect?: string | null
          morse_ambulatory_aid?: string | null
          morse_fall_history?: string | null
          morse_gait?: string | null
          morse_iv?: string | null
          morse_mental_status?: string | null
          morse_secondary_diagnosis?: string | null
          motor_function?: string | null
          mouth_and_throat?: string | null
          muscle_strength?: string | null
          musculoskeletal_selections?: string | null
          neuro_selections?: string | null
          neuro_sensation?: string | null
          nose?: string | null
          nursing_care_provided?: string | null
          oral_intake_ml?: string | null
          orientation?: string | null
          output_selections?: string | null
          oxygen_device?: string | null
<<<<<<< HEAD
=======
          pain?: string | null
>>>>>>> 3388220 (update lab_result schema)
          pain_aggravating_factors?: string | null
          pain_alleviating_factors?: string | null
          pain_characteristics?: string | null
          pain_interventions?: string | null
          pain_location?: string | null
          pain_numeric_scale?: string | null
          painad_body_language?: string | null
          painad_breathing?: string | null
          painad_consolability?: string | null
          painad_facial_expression?: string | null
          painad_negative_vocalization?: string | null
          parenteral_intake_ml?: string | null
          periwound_skin?: string | null
          primary_wound_dressing?: string | null
          psychosocial_selections?: string | null
          pupils?: string | null
          respiratory_selections?: string | null
          rr?: string | null
          safety_check?: string | null
          secondary_wound_dressing?: string | null
          skin?: string | null
          speech?: string | null
          spo2?: string | null
<<<<<<< HEAD
          stool_occurrence?: string | null
          stool_output_ml?: string | null
          supplemental_o2_rate?: string | null
=======
          stool?: string | null
          supplemental_o2_rate?: string | null
          tactile_disturbances?: number | null
>>>>>>> 3388220 (update lab_result schema)
          temp?: string | null
          temp_source?: string | null
          time_offset?: number
          turgor?: string | null
          urine_description?: string | null
          urine_occurrence?: string | null
          urine_output_ml?: string | null
          user_id?: string
          voiding?: string | null
          weight_kg?: string | null
          wound?: string | null
          wound_bed?: string | null
          wound_dimensions?: string | null
          wound_exudate?: string | null
          wound_location?: string | null
          wound_output_ml?: string | null
          wound_stage?: string | null
          wound_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "editable_documentation_results_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "editable_documentation_results_case_session_id_fkey"
            columns: ["case_session_id"]
            isOneToOne: false
            referencedRelation: "case_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "editable_documentation_results_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "editable_documentation_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty_section: {
        Row: {
          active: boolean | null
          created_at: string | null
          faculty_id: string | null
          id: string
          section_id: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          faculty_id?: string | null
          id?: string
          section_id?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          faculty_id?: string | null
          id?: string
          section_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faculty_section_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_section_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          active: boolean | null
          created_at: string | null
          group_id: string | null
          id: string
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string | null
          id: string
          name: string
          section_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          section_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          section_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "groups_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      imaging_reports: {
        Row: {
          case_id: string
          created_at: string
          findings: Json
          id: string
          impressions: string[]
          is_critical: boolean
          lab_id: string
          name: string
          technique: string
        }
        Insert: {
          case_id: string
          created_at?: string
          findings?: Json
          id?: string
          impressions?: string[]
          is_critical?: boolean
          lab_id: string
          name: string
          technique: string
        }
        Update: {
          case_id?: string
          created_at?: string
          findings?: Json
          id?: string
          impressions?: string[]
          is_critical?: boolean
          lab_id?: string
          name?: string
          technique?: string
        }
        Relationships: [
          {
            foreignKeyName: "imaging_reports_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imaging_reports_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "lab_results"
            referencedColumns: ["id"]
          },
        ]
      }
      isolation_precautions: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      lab_results: {
        Row: {
          albumin: string | null
          alp: string | null
          alt: string | null
          ammonia: string | null
          amylase: string | null
          art_pco2: string | null
          art_ph: string | null
          art_po2: string | null
          art_so2: string | null
          ast: string | null
          basophils: string | null
          blood_type: string | null
          bnp: string | null
          bun: string | null
          calcium: string | null
          case_id: string
          chloride: string | null
          ckmb: string | null
          created_at: string
          creatinine: string | null
          crp: string | null
          d_dimer: string | null
          data: Json
          eosinophils: string | null
          esr: string | null
          free_t3: string | null
          free_t4: string | null
          glucose: string | null
          hba1c: string | null
          hco3: string | null
          hdl_cholesterol: string | null
          hematocrit: string | null
          hemoglobin: string | null
          id: string
          inr: string | null
          is_in_presim: boolean
          ketones: string | null
          lactate: string | null
          ldl_cholesterol: string | null
          leukocyte_esterase: string | null
          lipase: string | null
          lymphocytes: string | null
          magnesium: string | null
          mch: string | null
          mchc: string | null
          mcv: string | null
          monocytes: string | null
          myoglobin: string | null
          neutrophils: string | null
          nitrites: string | null
<<<<<<< HEAD
          pco2: number | null
          phosphate: number | null
          platelets: number | null
          po2: number | null
          potassium: number | null
          protein: string | null
          pt: number | null
          ptt: number | null
          rbc: number | null
=======
          phosphate: string | null
          platelets: string | null
          potassium: string | null
          procal: string | null
          pt: string | null
          ptt: string | null
          rbc: string | null
>>>>>>> 3388220 (update lab_result schema)
          rh_factor: string | null
          sodium: string | null
          specific_gravity: string | null
          time_offset: number
          total_bilirubin: string | null
          total_cholesterol: string | null
          total_co2: string | null
          triglycerides: string | null
          troponin: string | null
          tsh: string | null
          urine_blood: string | null
          urine_glucose: string | null
          urine_ph: string | null
          urine_protein: string | null
          ven_pco2: string | null
          ven_ph: string | null
          ven_po2: string | null
          ven_so2: string | null
          wbc: string | null
        }
        Insert: {
          albumin?: string | null
          alp?: string | null
          alt?: string | null
          ammonia?: string | null
          amylase?: string | null
          art_pco2?: string | null
          art_ph?: string | null
          art_po2?: string | null
          art_so2?: string | null
          ast?: string | null
          basophils?: string | null
          blood_type?: string | null
          bnp?: string | null
          bun?: string | null
          calcium?: string | null
          case_id: string
          chloride?: string | null
          ckmb?: string | null
          created_at?: string
          creatinine?: string | null
          crp?: string | null
          d_dimer?: string | null
          data?: Json
          eosinophils?: string | null
          esr?: string | null
          free_t3?: string | null
          free_t4?: string | null
          glucose?: string | null
          hba1c?: string | null
          hco3?: string | null
          hdl_cholesterol?: string | null
          hematocrit?: string | null
          hemoglobin?: string | null
          id?: string
          inr?: string | null
          is_in_presim?: boolean
          ketones?: string | null
          lactate?: string | null
          ldl_cholesterol?: string | null
          leukocyte_esterase?: string | null
          lipase?: string | null
          lymphocytes?: string | null
          magnesium?: string | null
          mch?: string | null
          mchc?: string | null
          mcv?: string | null
          monocytes?: string | null
          myoglobin?: string | null
          neutrophils?: string | null
          nitrites?: string | null
<<<<<<< HEAD
          pco2?: number | null
          phosphate?: number | null
          platelets?: number | null
          po2?: number | null
          potassium?: number | null
          protein?: string | null
          pt?: number | null
          ptt?: number | null
          rbc?: number | null
=======
          phosphate?: string | null
          platelets?: string | null
          potassium?: string | null
          procal?: string | null
          pt?: string | null
          ptt?: string | null
          rbc?: string | null
>>>>>>> 3388220 (update lab_result schema)
          rh_factor?: string | null
          sodium?: string | null
          specific_gravity?: string | null
          time_offset: number
          total_bilirubin?: string | null
          total_cholesterol?: string | null
          total_co2?: string | null
          triglycerides?: string | null
          troponin?: string | null
          tsh?: string | null
          urine_blood?: string | null
          urine_glucose?: string | null
          urine_ph?: string | null
          urine_protein?: string | null
          ven_pco2?: string | null
          ven_ph?: string | null
          ven_po2?: string | null
          ven_so2?: string | null
          wbc?: string | null
        }
        Update: {
          albumin?: string | null
          alp?: string | null
          alt?: string | null
          ammonia?: string | null
          amylase?: string | null
          art_pco2?: string | null
          art_ph?: string | null
          art_po2?: string | null
          art_so2?: string | null
          ast?: string | null
          basophils?: string | null
          blood_type?: string | null
          bnp?: string | null
          bun?: string | null
          calcium?: string | null
          case_id?: string
          chloride?: string | null
          ckmb?: string | null
          created_at?: string
          creatinine?: string | null
          crp?: string | null
          d_dimer?: string | null
          data?: Json
          eosinophils?: string | null
          esr?: string | null
          free_t3?: string | null
          free_t4?: string | null
          glucose?: string | null
          hba1c?: string | null
          hco3?: string | null
          hdl_cholesterol?: string | null
          hematocrit?: string | null
          hemoglobin?: string | null
          id?: string
          inr?: string | null
          is_in_presim?: boolean
          ketones?: string | null
          lactate?: string | null
          ldl_cholesterol?: string | null
          leukocyte_esterase?: string | null
          lipase?: string | null
          lymphocytes?: string | null
          magnesium?: string | null
          mch?: string | null
          mchc?: string | null
          mcv?: string | null
          monocytes?: string | null
          myoglobin?: string | null
          neutrophils?: string | null
          nitrites?: string | null
<<<<<<< HEAD
          pco2?: number | null
          phosphate?: number | null
          platelets?: number | null
          po2?: number | null
          potassium?: number | null
          protein?: string | null
          pt?: number | null
          ptt?: number | null
          rbc?: number | null
=======
          phosphate?: string | null
          platelets?: string | null
          potassium?: string | null
          procal?: string | null
          pt?: string | null
          ptt?: string | null
          rbc?: string | null
>>>>>>> 3388220 (update lab_result schema)
          rh_factor?: string | null
          sodium?: string | null
          specific_gravity?: string | null
          time_offset?: number
          total_bilirubin?: string | null
          total_cholesterol?: string | null
          total_co2?: string | null
          triglycerides?: string | null
          troponin?: string | null
          tsh?: string | null
          urine_blood?: string | null
          urine_glucose?: string | null
          urine_ph?: string | null
          urine_protein?: string | null
          ven_pco2?: string | null
          ven_ph?: string | null
          ven_po2?: string | null
          ven_so2?: string | null
          wbc?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_results_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_administrations: {
        Row: {
          administered_dose: number | null
          administrator: string | null
          case_id: string
          created_at: string
          id: string
          infusion_rate: number | null
          is_in_presim: boolean
          medication_order_id: string | null
          notes: string | null
          phase: number
          status: string | null
          time_offset: number
        }
        Insert: {
          administered_dose?: number | null
          administrator?: string | null
          case_id: string
          created_at?: string
          id?: string
          infusion_rate?: number | null
          is_in_presim?: boolean
          medication_order_id?: string | null
          notes?: string | null
          phase?: number
          status?: string | null
          time_offset: number
        }
        Update: {
          administered_dose?: number | null
          administrator?: string | null
          case_id?: string
          created_at?: string
          id?: string
          infusion_rate?: number | null
          is_in_presim?: boolean
          medication_order_id?: string | null
          notes?: string | null
          phase?: number
          status?: string | null
          time_offset?: number
        }
        Relationships: [
          {
            foreignKeyName: "medication_administrations_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_administrations_medication_order_id_fkey"
            columns: ["medication_order_id"]
            isOneToOne: false
            referencedRelation: "medication_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_orders: {
        Row: {
          case_id: string
          dose: number | null
          frequency: Database["public"]["Enums"]["medication_frequencies"]
          id: string
          indication: string | null
          infusion_rate: number | null
          instructions: string | null
          is_in_presim: boolean
          medication_id: string
          ordering_provider: string | null
          phase: number
          priority: Database["public"]["Enums"]["medication_priorities"]
        }
        Insert: {
          case_id: string
          dose?: number | null
          frequency: Database["public"]["Enums"]["medication_frequencies"]
          id?: string
          indication?: string | null
          infusion_rate?: number | null
          instructions?: string | null
          is_in_presim?: boolean
          medication_id: string
          ordering_provider?: string | null
          phase?: number
          priority: Database["public"]["Enums"]["medication_priorities"]
        }
        Update: {
          case_id?: string
          dose?: number | null
          frequency?: Database["public"]["Enums"]["medication_frequencies"]
          id?: string
          indication?: string | null
          infusion_rate?: number | null
          instructions?: string | null
          is_in_presim?: boolean
          medication_id?: string
          ordering_provider?: string | null
          phase?: number
          priority?: Database["public"]["Enums"]["medication_priorities"]
        }
        Relationships: [
          {
            foreignKeyName: "medication_orders_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_orders_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          brand_name: string | null
          diluent: string | null
          dispense_unit_id: number
          generic_name: string
          id: string
          infusion_rate_unit:
            | Database["public"]["Enums"]["iv_infusion_rate_type"]
            | null
          is_variable_dose: boolean
          route: Database["public"]["Enums"]["medication_route_type"]
          strength: number
          strength_unit: string
          total_volume: number | null
        }
        Insert: {
          brand_name?: string | null
          diluent?: string | null
          dispense_unit_id: number
          generic_name: string
          id?: string
          infusion_rate_unit?:
            | Database["public"]["Enums"]["iv_infusion_rate_type"]
            | null
          is_variable_dose?: boolean
          route: Database["public"]["Enums"]["medication_route_type"]
          strength: number
          strength_unit: string
          total_volume?: number | null
        }
        Update: {
          brand_name?: string | null
          diluent?: string | null
          dispense_unit_id?: number
          generic_name?: string
          id?: string
          infusion_rate_unit?:
            | Database["public"]["Enums"]["iv_infusion_rate_type"]
            | null
          is_variable_dose?: boolean
          route?: Database["public"]["Enums"]["medication_route_type"]
          strength?: number
          strength_unit?: string
          total_volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "medications_dispense_unit_id_fkey"
            columns: ["dispense_unit_id"]
            isOneToOne: false
            referencedRelation: "dispense_units"
            referencedColumns: ["id"]
          },
        ]
      }
      microbiology_reports: {
        Row: {
          appearance: string
          case_id: string
          comments: string
          created_at: string
          culture_results: string
          id: string
          is_critical: string | null
          lab_id: string
          location: string | null
          microscopy: string
          name: string
          reporter: string
          sample_type: string
          sensitivity: string
        }
        Insert: {
          appearance: string
          case_id: string
          comments: string
          created_at?: string
          culture_results: string
          id?: string
          is_critical?: string | null
          lab_id: string
          location?: string | null
          microscopy: string
          name: string
          reporter: string
          sample_type: string
          sensitivity: string
        }
        Update: {
          appearance?: string
          case_id?: string
          comments?: string
          created_at?: string
          culture_results?: string
          id?: string
          is_critical?: string | null
          lab_id?: string
          location?: string | null
          microscopy?: string
          name?: string
          reporter?: string
          sample_type?: string
          sensitivity?: string
        }
        Relationships: [
          {
            foreignKeyName: "microbiology_reports_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "microbiology_reports_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "lab_results"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          case_id: string
          category: string
          created_at: string
          details: string
          id: string
          is_important: boolean
          is_in_presim: boolean
          phase: number
          provider: string
          status: string
          title: string
        }
        Insert: {
          case_id: string
          category: string
          created_at?: string
          details: string
          id?: string
          is_important?: boolean
          is_in_presim?: boolean
          phase?: number
          provider: string
          status: string
          title: string
        }
        Update: {
          case_id?: string
          category?: string
          created_at?: string
          details?: string
          id?: string
          is_important?: boolean
          is_in_presim?: boolean
          phase?: number
          provider?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      relationship_statuses: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      relationship_types: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      safety_alerts: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      section_assignments: {
        Row: {
          case_id: string | null
          created_at: string | null
          id: string
          presim_time: string
          section_id: string | null
          sim_time: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string | null
          id?: string
          presim_time: string
          section_id?: string | null
          sim_time: string
        }
        Update: {
          case_id?: string | null
          created_at?: string | null
          id?: string
          presim_time?: string
          section_id?: string | null
          sim_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "section_assignments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_assignments_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          course_id: string | null
          created_at: string | null
          end_date: string | null
          id: string
          meeting_time: string | null
          name: string
          semester: string | null
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          meeting_time?: string | null
          name: string
          semester?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          meeting_time?: string | null
          name?: string
          semester?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sections_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      student_medication_administrations: {
        Row: {
          administered_dose: number | null
          administrator: string | null
          case_id: string
          case_session_id: string
          created_at: string
          group_id: string
          infusion_rate: number | null
          is_in_presim: boolean
          medication_id: string | null
          medication_order_id: string | null
          notes: string | null
          status: string | null
          time_offset: number
          user_id: string
        }
        Insert: {
          administered_dose?: number | null
          administrator?: string | null
          case_id: string
          case_session_id: string
          created_at?: string
          group_id: string
          infusion_rate?: number | null
          is_in_presim?: boolean
          medication_id?: string | null
          medication_order_id?: string | null
          notes?: string | null
          status?: string | null
          time_offset: number
          user_id: string
        }
        Update: {
          administered_dose?: number | null
          administrator?: string | null
          case_id?: string
          case_session_id?: string
          created_at?: string
          group_id?: string
          infusion_rate?: number | null
          is_in_presim?: boolean
          medication_id?: string | null
          medication_order_id?: string | null
          notes?: string | null
          status?: string | null
          time_offset?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_medication_administrations_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_medication_administrations_case_session_id_fkey"
            columns: ["case_session_id"]
            isOneToOne: false
            referencedRelation: "case_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_medication_administrations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_medication_administrations_medication_order_id_fkey"
            columns: ["medication_order_id"]
            isOneToOne: false
            referencedRelation: "medication_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_medication_administrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["user_role"]
          status: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          role: Database["public"]["Enums"]["user_role"]
          status?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          status?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      all_clinical_documents: {
        Row: {
          author: string | null
          case_id: string | null
          case_session_id: string | null
          category:
            | Database["public"]["Enums"]["clinical_doc_category_type"]
            | null
          doc_text: string | null
          id: string | null
          is_in_presim: boolean | null
          phase: number | null
          source_type: string | null
          specialty: string | null
          time_offset: number | null
        }
        Relationships: []
      }
      all_documentation_results: {
        Row: {
          abdomen: string | null
          appearance: string | null
          assessment_tool_selections: string | null
          bowel_sounds: string | null
          bp: string | null
          bp_position: string | null
          bp_source: string | null
          braden_activity: string | null
          braden_friction_and_shear: string | null
          braden_mobility: string | null
          braden_moisture: string | null
          braden_nutrition: string | null
          braden_sensory_perception: string | null
          cardiac_extremities: string | null
          cardiovascular_selections: string | null
          case_id: string | null
          case_session_id: string | null
          chest_appearance: string | null
          ciwa_agitation: string | null
          ciwa_anxiety: string | null
          ciwa_headache: string | null
          ciwa_nausea_vomiting: string | null
          ciwa_orientation: string | null
          ciwa_sweats: string | null
          ciwa_tactile: string | null
          ciwa_tremor: string | null
          ciwa_visual: string | null
          created_at: string | null
          ears: string | null
          emesis_occurrence: string | null
          emesis_output_ml: string | null
          enteral_intake_ml: string | null
          enteral_output_ml: string | null
          extremity_rom: string | null
          eyes: string | null
          faces_pain_scale: string | null
          gait: string | null
          general_appearance_selections: string | null
          genitourinary_selections: string | null
          gi_selections: string | null
          gi_symptoms: string | null
          group_id: string | null
          hair_and_nails: string | null
          head_and_scalp: string | null
          heart_sounds: string | null
          heent_selections: string | null
          hr: string | null
          hr_source: string | null
          id: string | null
          intake_selections: string | null
          integument_selections: string | null
          is_in_presim: boolean | null
          iv_intake_ml: string | null
          iv_location_1: string | null
          iv_location_2: string | null
          iv_site_1: string | null
          iv_site_2: string | null
          iv_type_1: string | null
          iv_type_2: string | null
          jugular_distention: string | null
          level_of_consciousness: string | null
          lung_sounds: string | null
          mean_arterial_pressure: string | null
          mental_status: string | null
          mood_and_affect: string | null
          morse_ambulatory_aid: string | null
          morse_fall_history: string | null
          morse_gait: string | null
          morse_iv: string | null
          morse_mental_status: string | null
          morse_secondary_diagnosis: string | null
          motor_function: string | null
          mouth_and_throat: string | null
          muscle_strength: string | null
          musculoskeletal_selections: string | null
          neuro_selections: string | null
          neuro_sensation: string | null
          nose: string | null
          nursing_care_provided: string | null
          oral_intake_ml: string | null
          orientation: string | null
          output_selections: string | null
          oxygen_device: string | null
<<<<<<< HEAD
          pain_aggravating_factors: string | null
          pain_alleviating_factors: string | null
          pain_characteristics: string | null
          pain_interventions: string | null
          pain_location: string | null
          pain_numeric_scale: string | null
          painad_body_language: string | null
          painad_breathing: string | null
          painad_consolability: string | null
          painad_facial_expression: string | null
          painad_negative_vocalization: string | null
          parenteral_intake_ml: string | null
          periwound_skin: string | null
          primary_wound_dressing: string | null
=======
          pain: string | null
          parenteral_nutrition: string | null
          paroxysmal_sweats: number | null
>>>>>>> 3388220 (update lab_result schema)
          psychosocial_selections: string | null
          pupils: string | null
          respiratory_selections: string | null
          rr: string | null
          safety_check: string | null
          secondary_wound_dressing: string | null
          skin: string | null
          source_type: string | null
          speech: string | null
          spo2: string | null
<<<<<<< HEAD
          stool_occurrence: string | null
          stool_output_ml: string | null
          supplemental_o2_rate: string | null
=======
          stool: string | null
          supplemental_o2_rate: string | null
          tactile_disturbances: number | null
>>>>>>> 3388220 (update lab_result schema)
          temp: string | null
          temp_source: string | null
          time_offset: number | null
          turgor: string | null
          urine_description: string | null
          urine_occurrence: string | null
          urine_output_ml: string | null
          user_id: string | null
          voiding: string | null
          weight_kg: string | null
          wound: string | null
          wound_bed: string | null
          wound_dimensions: string | null
          wound_exudate: string | null
          wound_location: string | null
          wound_output_ml: string | null
          wound_stage: string | null
          wound_type: string | null
        }
        Relationships: []
      }
      all_medication_administrations: {
        Row: {
          administered_dose: number | null
          administrator: string | null
          case_id: string | null
          case_session_id: string | null
          infusion_rate: number | null
          is_in_presim: boolean | null
          medication_order_id: string | null
          notes: string | null
          phase: number | null
          source_type: string | null
          status: string | null
          time_offset: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      case_builder_replace_clinical_documents: {
        Args: { p_case_id: string; p_rows: Json }
        Returns: undefined
      }
      case_builder_replace_documentation: {
        Args: { p_case_id: string; p_rows: Json }
        Returns: undefined
      }
      case_builder_replace_history: {
        Args: { p_case_id: string; p_history: Json }
        Returns: undefined
      }
<<<<<<< HEAD
      case_builder_replace_labs: {
        Args: {
          p_case_id: string
          p_imaging_rows: Json
          p_lab_rows: Json
          p_microbiology_rows: Json
        }
        Returns: undefined
      }
=======
      case_builder_replace_labs:
        | { Args: { p_case_id: string; p_lab_rows: Json }; Returns: undefined }
        | {
            Args: {
              p_case_id: string
              p_imaging_rows: Json
              p_lab_rows: Json
              p_microbiology_rows: Json
            }
            Returns: undefined
          }
>>>>>>> 3388220 (update lab_result schema)
      case_builder_replace_media: {
        Args: { p_case_id: string; p_rows: Json }
        Returns: undefined
      }
      case_builder_replace_medications: {
        Args: { p_administrations: Json; p_case_id: string; p_orders: Json }
        Returns: undefined
      }
      case_builder_replace_orders: {
        Args: { p_case_id: string; p_rows: Json }
        Returns: undefined
      }
      get_user_courses: { Args: { p_user_id: string }; Returns: Json }
    }
    Enums: {
      case_specialty_type: "med_surg" | "ob" | "mental_health" | "public_health"
      clinical_doc_category_type:
        | "Admission"
        | "Consent"
        | "Consult"
        | "Discharge"
        | "History & Physical"
        | "Nursing"
        | "Post-op"
        | "Pre-op"
        | "Progress"
        | "Rapid Response"
        | "Telehealth"
        | "Student"
      code_status_type: "Full" | "DNR" | "Partial"
      flexsheet_section_type:
        | "vitals"
        | "vitals_overview"
        | "input"
        | "output"
        | "base_pain"
        | "faces_pain"
        | "general_appearance"
        | "psychosocial"
        | "heent"
        | "neuro"
        | "integument"
        | "cardiac"
        | "respiratory"
        | "wound"
        | "gi"
        | "musculoskeletal"
        | "genitourinary"
        | "iv_1"
        | "iv_2"
        | "nursing_care"
        | "braden"
        | "morse"
        | "ciwa"
        | "painad"
      insurance_type: "Medicare" | "Medicaid" | "Private"
      iv_infusion_rate_type: "mL/hr" | "mg/hr" | "units/hr"
      medication_frequencies:
        | "QD"
        | "BID"
        | "TID"
        | "QID"
        | "Q1H"
        | "Q2H"
        | "Q3H"
        | "Q4H"
        | "Q6H"
        | "Q8H"
        | "Q12H"
        | "Q24H"
        | "ACHS"
        | "DAILY"
        | "ONCE"
        | "CONTINUOUS"
      medication_priorities: "STAT" | "NOW" | "Routine" | "PRN"
      medication_route_type:
        | "PO"
        | "IV"
        | "SC"
        | "IM"
        | "SL"
        | "Topical"
        | "Otic"
        | "Ophthalmic"
        | "Inhalation"
      user_role: "student" | "admin" | "faculty"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      case_specialty_type: ["med_surg", "ob", "mental_health", "public_health"],
      clinical_doc_category_type: [
        "Admission",
        "Consent",
        "Consult",
        "Discharge",
        "History & Physical",
        "Nursing",
        "Post-op",
        "Pre-op",
        "Progress",
        "Rapid Response",
        "Telehealth",
        "Student",
      ],
      code_status_type: ["Full", "DNR", "Partial"],
      flexsheet_section_type: [
        "vitals",
        "vitals_overview",
        "input",
        "output",
        "base_pain",
        "faces_pain",
        "general_appearance",
        "psychosocial",
        "heent",
        "neuro",
        "integument",
        "cardiac",
        "respiratory",
        "wound",
        "gi",
        "musculoskeletal",
        "genitourinary",
        "iv_1",
        "iv_2",
        "nursing_care",
        "braden",
        "morse",
        "ciwa",
        "painad",
      ],
      insurance_type: ["Medicare", "Medicaid", "Private"],
      iv_infusion_rate_type: ["mL/hr", "mg/hr", "units/hr"],
      medication_frequencies: [
        "QD",
        "BID",
        "TID",
        "QID",
        "Q1H",
        "Q2H",
        "Q3H",
        "Q4H",
        "Q6H",
        "Q8H",
        "Q12H",
        "Q24H",
        "ACHS",
        "DAILY",
        "ONCE",
        "CONTINUOUS",
      ],
      medication_priorities: ["STAT", "NOW", "Routine", "PRN"],
      medication_route_type: [
        "PO",
        "IV",
        "SC",
        "IM",
        "SL",
        "Topical",
        "Otic",
        "Ophthalmic",
        "Inhalation",
      ],
      user_role: ["student", "admin", "faculty"],
    },
  },
} as const

