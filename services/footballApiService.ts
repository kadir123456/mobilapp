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

// Hata ayıklama için timeout ekle
const fetchWithTimeout = async (url: string, options: any, timeout = 10000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
};

const findTeam = async (teamName: string): Promise<Team | null> => {
    try {
        const response = await fetchWithTimeout(
            `${API_BASE_URL}/teams?search=${encodeURIComponent(teamName)}`, 
            { headers }
        );
        
        if (!response.ok) {
            console.error(`Takım arama hatası: ${response.status}`);
            return null;
        }
        
        const data: TeamResponse = await response.json();
        return data.response.length > 0 ? data.response[0].team : null;
    } catch (error) {
        console.error(`Takım arama hatası (${teamName}):`, error);
        return null;
    }
};

const getH2H = async (team1Id: number, team2Id: number): Promise<Fixture[]> => {
    try {
        const response = await fetchWithTimeout(
            `${API_BASE_URL}/fixtures/headtohead?h2h=${team1Id}-${team2Id}&last=10`, 
            { headers }
        );
        
        if (!response.ok) return [];
        const data: H2HResponse = await response.json();
        return data.response || [];
    } catch (error) {
        console.error('H2H veri hatası:', error);
        return [];
    }
};

const getLast10Fixtures = async (teamId: number): Promise<Fixture[]> => {
    try {
        const response = await fetchWithTimeout(
            `${API_BASE_URL}/fixtures?team=${teamId}&last=10`, 
            { headers }
        );
        
        if (!response.ok) return [];
        const data: FixtureResponse = await response.json();
        return data.response || [];
    } catch (error) {
        console.error('Maç verisi hatası:', error);
        return [];
    }
};

const getInjuries = async (teamId: number): Promise<InjuriesResponse['response']> => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetchWithTimeout(
            `${API_BASE_URL}/injuries?team=${teamId}&date=${today}`, 
            { headers }
        );
        
        if (!response.ok) return [];
        const data: InjuriesResponse = await response.json();
        return data.response || [];
    } catch (error) {
        console.error('Sakatlık verisi hatası:', error);
        return [];
    }
};

export const fetchMatchData = async (matchString: string): Promise<StructuredMatchData | null> => {
    try {
        const teamNames = matchString.split(/\s+vs\s+/i);
        if (teamNames.length !== 2) {
            console.warn(`Geçersiz maç formatı: ${matchString}`);
            return null;
        }

        const [homeTeamName, awayTeamName] = teamNames.map(t => t.trim());

        console.log(`Takımlar aranıyor: ${homeTeamName} vs ${awayTeamName}`);

        const homeTeam = await findTeam(homeTeamName);
        const awayTeam = await findTeam(awayTeamName);

        if (!homeTeam || !awayTeam) {
            console.warn(`Takımlar bulunamadı: ${homeTeamName} veya ${awayTeamName}`);
            return null;
        }

        console.log(`Takımlar bulundu: ${homeTeam.name} (${homeTeam.id}) vs ${awayTeam.name} (${awayTeam.id})`);

        // Verileri paralel olarak çek ama hata durumunda devam et
        const [h2h, homeFixtures, awayFixtures, homeInjuries, awayInjuries] = await Promise.allSettled([
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
                h2h: h2h.status === 'fulfilled' ? h2h.value : [],
                homeTeamLast10: homeFixtures.status === 'fulfilled' ? homeFixtures.value : [],
                awayTeamLast10: awayFixtures.status === 'fulfilled' ? awayFixtures.value : [],
                injuries: {
                    home: homeInjuries.status === 'fulfilled' ? homeInjuries.value : [],
                    away: awayInjuries.status === 'fulfilled' ? awayInjuries.value : []
                }
            }
        };

    } catch (error) {
        console.error(`"${matchString}" için veri çekilirken hata:`, error);
        return null;
    }
};