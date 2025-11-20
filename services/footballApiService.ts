import type { 
    Team, Fixture, H2HResponse, FixtureResponse, TeamResponse, 
    InjuriesResponse, StructuredMatchData 
} from '../types';

const API_KEY = process.env.VITE_FOOTBALL_API_KEY;
const API_HOST = 'v3.football.api-sports.io';
const API_BASE_URL = `https://${API_HOST}`;

const headers = {
    'x-rapidapi-host': API_HOST,
    'x-rapidapi-key': API_KEY || '',
};

const findTeam = async (teamName: string): Promise<Team | null> => {
    const response = await fetch(`${API_BASE_URL}/teams?search=${encodeURIComponent(teamName)}`, { headers });
    if (!response.ok) return null;
    const data: TeamResponse = await response.json();
    // En iyi eşleşmeyi bulmak için basit bir mantık
    return data.response.length > 0 ? data.response[0].team : null;
};

const getH2H = async (team1Id: number, team2Id: number): Promise<Fixture[]> => {
    const response = await fetch(`${API_BASE_URL}/fixtures/headtohead?h2h=${team1Id}-${team2Id}&last=10`, { headers });
    if (!response.ok) return [];
    const data: H2HResponse = await response.json();
    return data.response;
};

const getLast10Fixtures = async (teamId: number): Promise<Fixture[]> => {
    const response = await fetch(`${API_BASE_URL}/fixtures?team=${teamId}&last=10`, { headers });
    if (!response.ok) return [];
    const data: FixtureResponse = await response.json();
    return data.response;
};

const getInjuries = async (teamId: number): Promise<InjuriesResponse['response']> => {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(`${API_BASE_URL}/injuries?team=${teamId}&date=${today}`, { headers });
    if (!response.ok) return [];
    const data: InjuriesResponse = await response.json();
    return data.response;
}

export const fetchMatchData = async (matchString: string): Promise<StructuredMatchData | null> => {
    try {
        const teamNames = matchString.split(/\s+vs\s+/i);
        if (teamNames.length !== 2) return null;

        const [homeTeamName, awayTeamName] = teamNames;

        const homeTeam = await findTeam(homeTeamName);
        const awayTeam = await findTeam(awayTeamName);

        if (!homeTeam || !awayTeam) {
             console.warn(`Takımlar bulunamadı: ${homeTeamName} veya ${awayTeamName}`);
             return null;
        }

        const [h2h, homeFixtures, awayFixtures, homeInjuries, awayInjuries] = await Promise.all([
            getH2H(homeTeam.id, awayTeam.id),
            getLast10Fixtures(homeTeam.id),
            getLast10Fixtures(awayTeam.id),
            getInjuries(homeTeam.id),
            getInjuries(awayTeam.id)
        ]);

        return {
            match: `${homeTeam.name} vs ${awayTeam.name}`,
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            data: {
                h2h,
                homeTeamLast10: homeFixtures,
                awayTeamLast10: awayFixtures,
                injuries: {
                    home: homeInjuries,
                    away: awayInjuries
                }
            }
        };

    } catch (error) {
        console.error(`"${matchString}" için veri çekilirken hata oluştu:`, error);
        return null;
    }
}