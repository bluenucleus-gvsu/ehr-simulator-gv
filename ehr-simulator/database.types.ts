export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      case_data: {
        Row: {
          age: number | null
          description: string | null
          diagnosis: string | null
          id: string
          name: string
        }
        Insert: {
          age?: number | null
          description?: string | null
          diagnosis?: string | null
          id?: string
          name: string
        }
        Update: {
          age?: number | null
          description?: string | null
          diagnosis?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
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
          allergies: string[] | null
          attending_provider: string | null
          case_creation_complete: boolean
          code_status: Database["public"]["Enums"]["code_status_type"]
          created_at: string | null
          date_of_birth: string | null
          description: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          employment: string | null
          first_name: string
          height_ft: number | null
          height_in: number | null
          id: string
          inpatient_duration_days: number | null
          insurance: Database["public"]["Enums"]["insurance_type"] | null
          intake_output_blocks: Json
          isolation_precautions_id: string | null
          language: string | null
          last_name: string
          living_situation: string[] | null
          medical_history: string[] | null
          name: string
          phase_count: number
          relationship_status_id: string | null
          religion: string | null
          requires_interpreter: boolean
          social_habits: string[] | null
          surgical_history: string[] | null
          time_of_admission: string | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          admitting_diagnosis?: string | null
          allergies?: string[] | null
          attending_provider?: string | null
          case_creation_complete?: boolean
          code_status: Database["public"]["Enums"]["code_status_type"]
          created_at?: string | null
          date_of_birth?: string | null
          description?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          employment?: string | null
          first_name: string
          height_ft?: number | null
          height_in?: number | null
          id?: string
          inpatient_duration_days?: number | null
          insurance?: Database["public"]["Enums"]["insurance_type"] | null
          intake_output_blocks?: Json
          isolation_precautions_id?: string | null
          language?: string | null
          last_name: string
          living_situation?: string[] | null
          medical_history?: string[] | null
          name: string
          phase_count?: number
          relationship_status_id?: string | null
          religion?: string | null
          requires_interpreter?: boolean
          social_habits?: string[] | null
          surgical_history?: string[] | null
          time_of_admission?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          admitting_diagnosis?: string | null
          allergies?: string[] | null
          attending_provider?: string | null
          case_creation_complete?: boolean
          code_status?: Database["public"]["Enums"]["code_status_type"]
          created_at?: string | null
          date_of_birth?: string | null
          description?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          employment?: string | null
          first_name?: string
          height_ft?: number | null
          height_in?: number | null
          id?: string
          inpatient_duration_days?: number | null
          insurance?: Database["public"]["Enums"]["insurance_type"] | null
          intake_output_blocks?: Json
          isolation_precautions_id?: string | null
          language?: string | null
          last_name?: string
          living_situation?: string[] | null
          medical_history?: string[] | null
          name?: string
          phase_count?: number
          relationship_status_id?: string | null
          religion?: string | null
          requires_interpreter?: boolean
          social_habits?: string[] | null
          surgical_history?: string[] | null
          time_of_admission?: string | null
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
          activity: number | null
          agitation: number | null
          ambulatory_aid: number | null
          anxiety: number | null
          appearance: string | null
          assessment_tool_selections: string | null
          body_language: number | null
          bowel_sounds: string | null
          bp: string | null
          bp_source: string | null
          breathing_independent_of_vocalization: number | null
          cardiovascular_selections: string | null
          case_id: string
          chest_appearance: string | null
          consolability: number | null
          created_at: string
          ears: string | null
          emesis: string | null
          enteral_nutrition: string | null
          enteral_output: string | null
          extremities: string | null
          extremity_rom: string | null
          eyes: string | null
          facial_expression: number | null
          fall_risk_gait: number | null
          friction_and_shear: number | null
          gait: string | null
          general_appearance_selections: string | null
          genitourinary_selections: string | null
          gi_selections: string | null
          hair_and_nails: string | null
          head_and_scalp: string | null
          headache: number | null
          heart_sounds: string | null
          heent_selections: string | null
          history_of_falling: number | null
          hr: string | null
          hr_source: string | null
          id: string
          intake_selections: string | null
          integument_selections: string | null
          integument_status: string | null
          intravenous: string | null
          is_in_presim: boolean
          iv_location: string | null
          iv_site: string | null
          iv_therapy_heparin_lock: number | null
          iv_type: string | null
          jugular_distention: string | null
          lung_sounds: string | null
          mental_status: number | null
          mobility: number | null
          moisture: number | null
          mood_and_affect: string | null
          motor_function: string | null
          mouth_and_throat: string | null
          musculoskeletal_selections: string | null
          nausea: string | null
          nausea_vomiting: number | null
          negative_vocalization: number | null
          neuro_selections: string | null
          nose: string | null
          nursing_care_provided: string | null
          nutrition: number | null
          oral: string | null
          orientation: string | null
          orientation2: number | null
          output_selections: string | null
          pain: string | null
          pain_aggravating_factors: string | null
          pain_alleviating_factors: string | null
          pain_characteristics: string | null
          pain_interventions: string | null
          pain_location: string | null
          parenteral_nutrition: string | null
          paroxysmal_sweats: number | null
          psychosocial_selections: string | null
          respiratory_selections: string | null
          rr: string | null
          safety_check: string | null
          secondary_diagnosis: number | null
          sensory_perception: number | null
          skin: string | null
          speech: string | null
          spo2: string | null
          spo2_source: string | null
          stool: string | null
          tactile_disturbances: number | null
          temp: string | null
          temp_source: string | null
          time_offset: number
          tremor: number | null
          turgor: string | null
          urine: string | null
          urine_description: string | null
          visual_disturbances: number | null
          voiding: string | null
          weight_kg: string | null
          wound: string | null
          wound_drainage: string | null
        }
        Insert: {
          abdomen?: string | null
          activity?: number | null
          agitation?: number | null
          ambulatory_aid?: number | null
          anxiety?: number | null
          appearance?: string | null
          assessment_tool_selections?: string | null
          body_language?: number | null
          bowel_sounds?: string | null
          bp?: string | null
          bp_source?: string | null
          breathing_independent_of_vocalization?: number | null
          cardiovascular_selections?: string | null
          case_id: string
          chest_appearance?: string | null
          consolability?: number | null
          created_at?: string
          ears?: string | null
          emesis?: string | null
          enteral_nutrition?: string | null
          enteral_output?: string | null
          extremities?: string | null
          extremity_rom?: string | null
          eyes?: string | null
          facial_expression?: number | null
          fall_risk_gait?: number | null
          friction_and_shear?: number | null
          gait?: string | null
          general_appearance_selections?: string | null
          genitourinary_selections?: string | null
          gi_selections?: string | null
          hair_and_nails?: string | null
          head_and_scalp?: string | null
          headache?: number | null
          heart_sounds?: string | null
          heent_selections?: string | null
          history_of_falling?: number | null
          hr?: string | null
          hr_source?: string | null
          id?: string
          intake_selections?: string | null
          integument_selections?: string | null
          integument_status?: string | null
          intravenous?: string | null
          is_in_presim?: boolean
          iv_location?: string | null
          iv_site?: string | null
          iv_therapy_heparin_lock?: number | null
          iv_type?: string | null
          jugular_distention?: string | null
          lung_sounds?: string | null
          mental_status?: number | null
          mobility?: number | null
          moisture?: number | null
          mood_and_affect?: string | null
          motor_function?: string | null
          mouth_and_throat?: string | null
          musculoskeletal_selections?: string | null
          nausea?: string | null
          nausea_vomiting?: number | null
          negative_vocalization?: number | null
          neuro_selections?: string | null
          nose?: string | null
          nursing_care_provided?: string | null
          nutrition?: number | null
          oral?: string | null
          orientation?: string | null
          orientation2?: number | null
          output_selections?: string | null
          pain?: string | null
          pain_aggravating_factors?: string | null
          pain_alleviating_factors?: string | null
          pain_characteristics?: string | null
          pain_interventions?: string | null
          pain_location?: string | null
          parenteral_nutrition?: string | null
          paroxysmal_sweats?: number | null
          psychosocial_selections?: string | null
          respiratory_selections?: string | null
          rr?: string | null
          safety_check?: string | null
          secondary_diagnosis?: number | null
          sensory_perception?: number | null
          skin?: string | null
          speech?: string | null
          spo2?: string | null
          spo2_source?: string | null
          stool?: string | null
          tactile_disturbances?: number | null
          temp?: string | null
          temp_source?: string | null
          time_offset: number
          tremor?: number | null
          turgor?: string | null
          urine?: string | null
          urine_description?: string | null
          visual_disturbances?: number | null
          voiding?: string | null
          weight_kg?: string | null
          wound?: string | null
          wound_drainage?: string | null
        }
        Update: {
          abdomen?: string | null
          activity?: number | null
          agitation?: number | null
          ambulatory_aid?: number | null
          anxiety?: number | null
          appearance?: string | null
          assessment_tool_selections?: string | null
          body_language?: number | null
          bowel_sounds?: string | null
          bp?: string | null
          bp_source?: string | null
          breathing_independent_of_vocalization?: number | null
          cardiovascular_selections?: string | null
          case_id?: string
          chest_appearance?: string | null
          consolability?: number | null
          created_at?: string
          ears?: string | null
          emesis?: string | null
          enteral_nutrition?: string | null
          enteral_output?: string | null
          extremities?: string | null
          extremity_rom?: string | null
          eyes?: string | null
          facial_expression?: number | null
          fall_risk_gait?: number | null
          friction_and_shear?: number | null
          gait?: string | null
          general_appearance_selections?: string | null
          genitourinary_selections?: string | null
          gi_selections?: string | null
          hair_and_nails?: string | null
          head_and_scalp?: string | null
          headache?: number | null
          heart_sounds?: string | null
          heent_selections?: string | null
          history_of_falling?: number | null
          hr?: string | null
          hr_source?: string | null
          id?: string
          intake_selections?: string | null
          integument_selections?: string | null
          integument_status?: string | null
          intravenous?: string | null
          is_in_presim?: boolean
          iv_location?: string | null
          iv_site?: string | null
          iv_therapy_heparin_lock?: number | null
          iv_type?: string | null
          jugular_distention?: string | null
          lung_sounds?: string | null
          mental_status?: number | null
          mobility?: number | null
          moisture?: number | null
          mood_and_affect?: string | null
          motor_function?: string | null
          mouth_and_throat?: string | null
          musculoskeletal_selections?: string | null
          nausea?: string | null
          nausea_vomiting?: number | null
          negative_vocalization?: number | null
          neuro_selections?: string | null
          nose?: string | null
          nursing_care_provided?: string | null
          nutrition?: number | null
          oral?: string | null
          orientation?: string | null
          orientation2?: number | null
          output_selections?: string | null
          pain?: string | null
          pain_aggravating_factors?: string | null
          pain_alleviating_factors?: string | null
          pain_characteristics?: string | null
          pain_interventions?: string | null
          pain_location?: string | null
          parenteral_nutrition?: string | null
          paroxysmal_sweats?: number | null
          psychosocial_selections?: string | null
          respiratory_selections?: string | null
          rr?: string | null
          safety_check?: string | null
          secondary_diagnosis?: number | null
          sensory_perception?: number | null
          skin?: string | null
          speech?: string | null
          spo2?: string | null
          spo2_source?: string | null
          stool?: string | null
          tactile_disturbances?: number | null
          temp?: string | null
          temp_source?: string | null
          time_offset?: number
          tremor?: number | null
          turgor?: string | null
          urine?: string | null
          urine_description?: string | null
          visual_disturbances?: number | null
          voiding?: string | null
          weight_kg?: string | null
          wound?: string | null
          wound_drainage?: string | null
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
          activity: number | null
          agitation: number | null
          ambulatory_aid: number | null
          anxiety: number | null
          appearance: string | null
          assessment_tool_selections: string | null
          body_language: number | null
          bowel_sounds: string | null
          bp: string | null
          bp_source: string | null
          breathing_independent_of_vocalization: number | null
          cardiovascular_selections: string | null
          case_id: string
          case_session_id: string
          chest_appearance: string | null
          consolability: number | null
          created_at: string
          ears: string | null
          emesis: string | null
          enteral_nutrition: string | null
          enteral_output: string | null
          extremities: string | null
          extremity_rom: string | null
          eyes: string | null
          facial_expression: number | null
          fall_risk_gait: number | null
          friction_and_shear: number | null
          gait: string | null
          general_appearance_selections: string | null
          genitourinary_selections: string | null
          gi_selections: string | null
          group_id: string
          hair_and_nails: string | null
          head_and_scalp: string | null
          headache: number | null
          heart_sounds: string | null
          heent_selections: string | null
          history_of_falling: number | null
          hr: string | null
          hr_source: string | null
          id: string
          intake_selections: string | null
          integument_selections: string | null
          integument_status: string | null
          intravenous: string | null
          is_in_presim: boolean
          iv_location: string | null
          iv_site: string | null
          iv_therapy_heparin_lock: number | null
          iv_type: string | null
          jugular_distention: string | null
          lung_sounds: string | null
          mental_status: number | null
          mobility: number | null
          moisture: number | null
          mood_and_affect: string | null
          motor_function: string | null
          mouth_and_throat: string | null
          musculoskeletal_selections: string | null
          nausea: string | null
          nausea_vomiting: number | null
          negative_vocalization: number | null
          neuro_selections: string | null
          nose: string | null
          nursing_care_provided: string | null
          nutrition: number | null
          oral: string | null
          orientation: string | null
          orientation2: number | null
          output_selections: string | null
          pain: string | null
          pain_aggravating_factors: string | null
          pain_alleviating_factors: string | null
          pain_characteristics: string | null
          pain_interventions: string | null
          pain_location: string | null
          parenteral_nutrition: string | null
          paroxysmal_sweats: number | null
          psychosocial_selections: string | null
          respiratory_selections: string | null
          rr: string | null
          safety_check: string | null
          secondary_diagnosis: number | null
          sensory_perception: number | null
          skin: string | null
          speech: string | null
          spo2: string | null
          spo2_source: string | null
          stool: string | null
          tactile_disturbances: number | null
          temp: string | null
          temp_source: string | null
          time_offset: number
          tremor: number | null
          turgor: string | null
          urine: string | null
          urine_description: string | null
          user_id: string
          visual_disturbances: number | null
          voiding: string | null
          weight_kg: string | null
          wound: string | null
          wound_drainage: string | null
        }
        Insert: {
          abdomen?: string | null
          activity?: number | null
          agitation?: number | null
          ambulatory_aid?: number | null
          anxiety?: number | null
          appearance?: string | null
          assessment_tool_selections?: string | null
          body_language?: number | null
          bowel_sounds?: string | null
          bp?: string | null
          bp_source?: string | null
          breathing_independent_of_vocalization?: number | null
          cardiovascular_selections?: string | null
          case_id: string
          case_session_id: string
          chest_appearance?: string | null
          consolability?: number | null
          created_at?: string
          ears?: string | null
          emesis?: string | null
          enteral_nutrition?: string | null
          enteral_output?: string | null
          extremities?: string | null
          extremity_rom?: string | null
          eyes?: string | null
          facial_expression?: number | null
          fall_risk_gait?: number | null
          friction_and_shear?: number | null
          gait?: string | null
          general_appearance_selections?: string | null
          genitourinary_selections?: string | null
          gi_selections?: string | null
          group_id: string
          hair_and_nails?: string | null
          head_and_scalp?: string | null
          headache?: number | null
          heart_sounds?: string | null
          heent_selections?: string | null
          history_of_falling?: number | null
          hr?: string | null
          hr_source?: string | null
          id?: string
          intake_selections?: string | null
          integument_selections?: string | null
          integument_status?: string | null
          intravenous?: string | null
          is_in_presim?: boolean
          iv_location?: string | null
          iv_site?: string | null
          iv_therapy_heparin_lock?: number | null
          iv_type?: string | null
          jugular_distention?: string | null
          lung_sounds?: string | null
          mental_status?: number | null
          mobility?: number | null
          moisture?: number | null
          mood_and_affect?: string | null
          motor_function?: string | null
          mouth_and_throat?: string | null
          musculoskeletal_selections?: string | null
          nausea?: string | null
          nausea_vomiting?: number | null
          negative_vocalization?: number | null
          neuro_selections?: string | null
          nose?: string | null
          nursing_care_provided?: string | null
          nutrition?: number | null
          oral?: string | null
          orientation?: string | null
          orientation2?: number | null
          output_selections?: string | null
          pain?: string | null
          pain_aggravating_factors?: string | null
          pain_alleviating_factors?: string | null
          pain_characteristics?: string | null
          pain_interventions?: string | null
          pain_location?: string | null
          parenteral_nutrition?: string | null
          paroxysmal_sweats?: number | null
          psychosocial_selections?: string | null
          respiratory_selections?: string | null
          rr?: string | null
          safety_check?: string | null
          secondary_diagnosis?: number | null
          sensory_perception?: number | null
          skin?: string | null
          speech?: string | null
          spo2?: string | null
          spo2_source?: string | null
          stool?: string | null
          tactile_disturbances?: number | null
          temp?: string | null
          temp_source?: string | null
          time_offset: number
          tremor?: number | null
          turgor?: string | null
          urine?: string | null
          urine_description?: string | null
          user_id: string
          visual_disturbances?: number | null
          voiding?: string | null
          weight_kg?: string | null
          wound?: string | null
          wound_drainage?: string | null
        }
        Update: {
          abdomen?: string | null
          activity?: number | null
          agitation?: number | null
          ambulatory_aid?: number | null
          anxiety?: number | null
          appearance?: string | null
          assessment_tool_selections?: string | null
          body_language?: number | null
          bowel_sounds?: string | null
          bp?: string | null
          bp_source?: string | null
          breathing_independent_of_vocalization?: number | null
          cardiovascular_selections?: string | null
          case_id?: string
          case_session_id?: string
          chest_appearance?: string | null
          consolability?: number | null
          created_at?: string
          ears?: string | null
          emesis?: string | null
          enteral_nutrition?: string | null
          enteral_output?: string | null
          extremities?: string | null
          extremity_rom?: string | null
          eyes?: string | null
          facial_expression?: number | null
          fall_risk_gait?: number | null
          friction_and_shear?: number | null
          gait?: string | null
          general_appearance_selections?: string | null
          genitourinary_selections?: string | null
          gi_selections?: string | null
          group_id?: string
          hair_and_nails?: string | null
          head_and_scalp?: string | null
          headache?: number | null
          heart_sounds?: string | null
          heent_selections?: string | null
          history_of_falling?: number | null
          hr?: string | null
          hr_source?: string | null
          id?: string
          intake_selections?: string | null
          integument_selections?: string | null
          integument_status?: string | null
          intravenous?: string | null
          is_in_presim?: boolean
          iv_location?: string | null
          iv_site?: string | null
          iv_therapy_heparin_lock?: number | null
          iv_type?: string | null
          jugular_distention?: string | null
          lung_sounds?: string | null
          mental_status?: number | null
          mobility?: number | null
          moisture?: number | null
          mood_and_affect?: string | null
          motor_function?: string | null
          mouth_and_throat?: string | null
          musculoskeletal_selections?: string | null
          nausea?: string | null
          nausea_vomiting?: number | null
          negative_vocalization?: number | null
          neuro_selections?: string | null
          nose?: string | null
          nursing_care_provided?: string | null
          nutrition?: number | null
          oral?: string | null
          orientation?: string | null
          orientation2?: number | null
          output_selections?: string | null
          pain?: string | null
          pain_aggravating_factors?: string | null
          pain_alleviating_factors?: string | null
          pain_characteristics?: string | null
          pain_interventions?: string | null
          pain_location?: string | null
          parenteral_nutrition?: string | null
          paroxysmal_sweats?: number | null
          psychosocial_selections?: string | null
          respiratory_selections?: string | null
          rr?: string | null
          safety_check?: string | null
          secondary_diagnosis?: number | null
          sensory_perception?: number | null
          skin?: string | null
          speech?: string | null
          spo2?: string | null
          spo2_source?: string | null
          stool?: string | null
          tactile_disturbances?: number | null
          temp?: string | null
          temp_source?: string | null
          time_offset?: number
          tremor?: number | null
          turgor?: string | null
          urine?: string | null
          urine_description?: string | null
          user_id?: string
          visual_disturbances?: number | null
          voiding?: string | null
          weight_kg?: string | null
          wound?: string | null
          wound_drainage?: string | null
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
          active: boolean
          created_at: string | null
          faculty_lead_id: string | null
          id: string
          name: string
          section_assignment_id: string | null
          section_id: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string | null
          faculty_lead_id?: string | null
          id?: string
          name: string
          section_assignment_id?: string | null
          section_id?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string | null
          faculty_lead_id?: string | null
          id?: string
          name?: string
          section_assignment_id?: string | null
          section_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "groups_faculty_lead_id_fkey"
            columns: ["faculty_lead_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_section_assignment_id_fkey"
            columns: ["section_assignment_id"]
            isOneToOne: false
            referencedRelation: "section_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      section_enrollments: {
        Row: {
          active: boolean
          created_at: string | null
          id: string
          section_id: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string | null
          id?: string
          section_id: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string | null
          id?: string
          section_id?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "section_enrollments_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
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
          albumin: number | null
          alp: number | null
          alt: number | null
          ammonia: number | null
          amylase: number | null
          ast: number | null
          blood: string | null
          bun: number | null
          calcium: number | null
          case_id: string
          chloride: number | null
          ckmb: number | null
          co2: number | null
          created_at: string
          creatinine: number | null
          crp: number | null
          data: Json
          esr: number | null
          free_t3: number | null
          free_t4: number | null
          glucose: number | null
          hco3: number | null
          hdl_cholesterol: number | null
          hematocrit: number | null
          hemoglobin: number | null
          id: string
          is_in_presim: boolean
          ketones: string | null
          lactate: number | null
          ldl_cholesterol: number | null
          leukocyte_esterase: string | null
          lipase: number | null
          magnesium: number | null
          mch: number | null
          mchc: number | null
          mcv: number | null
          myoglobin: number | null
          nitrites: string | null
          pco2: number | null
          phase: number
          phosphate: number | null
          platelets: number | null
          po2: number | null
          potassium: number | null
          protein: string | null
          pt: number | null
          ptt: number | null
          rbc: number | null
          sodium: number | null
          specific_gravity: number | null
          time_offset: number
          total_bilirubin: number | null
          total_cholesterol: number | null
          triglycerides: number | null
          troponin: number | null
          tsh: number | null
          urine_glucose: string | null
          urine_ph: number | null
          wbc: number | null
        }
        Insert: {
          albumin?: number | null
          alp?: number | null
          alt?: number | null
          ammonia?: number | null
          amylase?: number | null
          ast?: number | null
          blood?: string | null
          bun?: number | null
          calcium?: number | null
          case_id: string
          chloride?: number | null
          ckmb?: number | null
          co2?: number | null
          created_at?: string
          creatinine?: number | null
          crp?: number | null
          data?: Json
          esr?: number | null
          free_t3?: number | null
          free_t4?: number | null
          glucose?: number | null
          hco3?: number | null
          hdl_cholesterol?: number | null
          hematocrit?: number | null
          hemoglobin?: number | null
          id?: string
          is_in_presim?: boolean
          ketones?: string | null
          lactate?: number | null
          ldl_cholesterol?: number | null
          leukocyte_esterase?: string | null
          lipase?: number | null
          magnesium?: number | null
          mch?: number | null
          mchc?: number | null
          mcv?: number | null
          myoglobin?: number | null
          nitrites?: string | null
          pco2?: number | null
          phase?: number
          phosphate?: number | null
          platelets?: number | null
          po2?: number | null
          potassium?: number | null
          protein?: string | null
          pt?: number | null
          ptt?: number | null
          rbc?: number | null
          sodium?: number | null
          specific_gravity?: number | null
          time_offset: number
          total_bilirubin?: number | null
          total_cholesterol?: number | null
          triglycerides?: number | null
          troponin?: number | null
          tsh?: number | null
          urine_glucose?: string | null
          urine_ph?: number | null
          wbc?: number | null
        }
        Update: {
          albumin?: number | null
          alp?: number | null
          alt?: number | null
          ammonia?: number | null
          amylase?: number | null
          ast?: number | null
          blood?: string | null
          bun?: number | null
          calcium?: number | null
          case_id?: string
          chloride?: number | null
          ckmb?: number | null
          co2?: number | null
          created_at?: string
          creatinine?: number | null
          crp?: number | null
          data?: Json
          esr?: number | null
          free_t3?: number | null
          free_t4?: number | null
          glucose?: number | null
          hco3?: number | null
          hdl_cholesterol?: number | null
          hematocrit?: number | null
          hemoglobin?: number | null
          id?: string
          is_in_presim?: boolean
          ketones?: string | null
          lactate?: number | null
          ldl_cholesterol?: number | null
          leukocyte_esterase?: string | null
          lipase?: number | null
          magnesium?: number | null
          mch?: number | null
          mchc?: number | null
          mcv?: number | null
          myoglobin?: number | null
          nitrites?: string | null
          pco2?: number | null
          phase?: number
          phosphate?: number | null
          platelets?: number | null
          po2?: number | null
          potassium?: number | null
          protein?: string | null
          pt?: number | null
          ptt?: number | null
          rbc?: number | null
          sodium?: number | null
          specific_gravity?: number | null
          time_offset?: number
          total_bilirubin?: number | null
          total_cholesterol?: number | null
          triglycerides?: number | null
          troponin?: number | null
          tsh?: number | null
          urine_glucose?: string | null
          urine_ph?: number | null
          wbc?: number | null
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
          role: string
          status: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          role?: string
          status?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          role?: string
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
          activity: number | null
          agitation: number | null
          ambulatory_aid: number | null
          anxiety: number | null
          appearance: string | null
          assessment_tool_selections: string | null
          body_language: number | null
          bowel_sounds: string | null
          bp: string | null
          bp_source: string | null
          breathing_independent_of_vocalization: number | null
          cardiovascular_selections: string | null
          case_id: string | null
          case_session_id: string | null
          chest_appearance: string | null
          consolability: number | null
          created_at: string | null
          ears: string | null
          emesis: string | null
          enteral_nutrition: string | null
          enteral_output: string | null
          extremities: string | null
          extremity_rom: string | null
          eyes: string | null
          facial_expression: number | null
          fall_risk_gait: number | null
          friction_and_shear: number | null
          gait: string | null
          general_appearance_selections: string | null
          genitourinary_selections: string | null
          gi_selections: string | null
          group_id: string | null
          hair_and_nails: string | null
          head_and_scalp: string | null
          headache: number | null
          heart_sounds: string | null
          heent_selections: string | null
          history_of_falling: number | null
          hr: string | null
          hr_source: string | null
          id: string | null
          intake_selections: string | null
          integument_selections: string | null
          integument_status: string | null
          intravenous: string | null
          is_in_presim: boolean | null
          iv_location: string | null
          iv_site: string | null
          iv_therapy_heparin_lock: number | null
          iv_type: string | null
          jugular_distention: string | null
          lung_sounds: string | null
          mental_status: number | null
          mobility: number | null
          moisture: number | null
          mood_and_affect: string | null
          motor_function: string | null
          mouth_and_throat: string | null
          musculoskeletal_selections: string | null
          nausea: string | null
          nausea_vomiting: number | null
          negative_vocalization: number | null
          neuro_selections: string | null
          nose: string | null
          nursing_care_provided: string | null
          nutrition: number | null
          oral: string | null
          orientation: string | null
          orientation2: number | null
          output_selections: string | null
          pain: string | null
          parenteral_nutrition: string | null
          paroxysmal_sweats: number | null
          psychosocial_selections: string | null
          respiratory_selections: string | null
          rr: string | null
          safety_check: string | null
          secondary_diagnosis: number | null
          sensory_perception: number | null
          skin: string | null
          source_type: string | null
          speech: string | null
          spo2: string | null
          spo2_source: string | null
          stool: string | null
          tactile_disturbances: number | null
          temp: string | null
          temp_source: string | null
          time_offset: number | null
          tremor: number | null
          turgor: string | null
          urine: string | null
          user_id: string | null
          visual_disturbances: number | null
          voiding: string | null
          weight_kg: string | null
          wound: string | null
          wound_drainage: string | null
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
      get_user_courses: { Args: { p_user_id: string }; Returns: Json }
    }
    Enums: {
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
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
    },
  },
} as const
