import type { Timestamp } from 'firebase/firestore.js';

export interface MatchAnalysis {
  match: string;
  prediction: string;
  confidence: 'Low' | 'Medium' | 'High';
  reasoning: string;
}

export type BetType = 'MS' | 'İY' | 'Handikap' | 'İY/MS' | 'KG' | 'Alt/Üst';

export interface AnalysisHistoryItem {
  id: string; // Firestore document ID
  analysisResults: MatchAnalysis[];
  createdAt: Timestamp;
  betType: BetType;
}

// --- Football API Types ---

export interface Team {
    id: number;
    name: string;
    logo: string;
}

export interface Fixture {
    fixture: {
        id: number;
        date: string;
        timestamp: number;
    };
    teams: {
        home: { id: number; name: string; winner: boolean | null; };
        away: { id: number; name: string; winner: boolean | null; };
    };
    goals: {
        home: number | null;
        away: number | null;
    };
}

export interface Injury {
    player: { id: number; name: string; };
    fixture: { id: number; };
    league: { id: number; };
}

// API Response Structures
export interface TeamResponse { response: { team: Team }[]; }
export interface H2HResponse { response: Fixture[]; }
export interface FixtureResponse { response: Fixture[]; }
export interface InjuriesResponse { response: Injury[]; }


// Gemini'ye gönderilecek yapılandırılmış veri
export interface StructuredMatchData {
    match: string;
    homeTeamId: number;
    awayTeamId: number;
    data: {
        h2h: Fixture[];
        homeTeamLast10: Fixture[];
        awayTeamLast10: Fixture[];
        injuries: {
            home: Injury[];
            away: Injury[];
        };
    };
}
