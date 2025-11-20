import { GoogleGenAI, Type } from "@google/genai";
import type { MatchAnalysis, BetType, StructuredMatchData } from "../types";

// Gemini API anahtarı artık merkezi ortam değişkenlerinden okunuyor.
const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY });

const matchListSchema = {
  type: Type.OBJECT,
  properties: {
    matches: {
      type: Type.ARRAY,
      description: 'Görselde tespit edilen tüm maçların bir listesi. Her öğe, "Ev Sahibi vs Deplasman" formatında bir string olmalıdır.',
      items: {
        type: Type.STRING
      }
    }
  },
  required: ["matches"],
};

const analysisSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      match: {
        type: Type.STRING,
        description: 'Maçtaki ev sahibi ve deplasman takımları. Örn: "Fenerbahçe vs Galatasaray"',
      },
      prediction: {
        type: Type.STRING,
        description: 'Seçilen bahis türü için spesifik tahmin. Örn: "Ev Sahibi Kazanır", "2.5 Gol Üstü", "Karşılıklı Gol Var"',
      },
      confidence: {
        type: Type.STRING,
        description: "Tahminin güven seviyesi: 'Low', 'Medium', ya da 'High'",
      },
      reasoning: {
        type: Type.STRING,
        description: 'Tahmine yol açan, SAĞLANAN VERİLERE dayalı detaylı, adım adım açıklama. H2H, son maçlar, gol ortalamaları gibi spesifik verileri referans göster.',
      },
    },
    required: ["match", "prediction", "confidence", "reasoning"],
  },
};

/**
 * 1. Adım: Görselden sadece maçların listesini çıkarır.
 */
export const extractMatchesFromImage = async (
  imageDataBase64: string,
  mimeType: string,
): Promise<string[]> => {
  const imagePart = {
    inlineData: { data: imageDataBase64, mimeType: mimeType },
  };
  const textPart = {
    text: "Bu görseldeki futbol bülteninden tüm maçları 'Ev Sahibi vs Deplasman' formatında listele. Sadece JSON formatında bir `matches` dizisi döndür. Başka hiçbir metin ekleme.",
  };

  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: { parts: [imagePart, textPart] },
    config: {
      responseMimeType: "application/json",
      responseSchema: matchListSchema,
    },
  });

  const cleanedJsonText = response.text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
  const parsed = JSON.parse(cleanedJsonText);
  return parsed.matches || [];
};

/**
 * 3. Adım: Futbol API'sinden alınan verilerle nihai analizi yapar.
 */
export const getAnalysisFromStructuredData = async (
  matchData: StructuredMatchData[],
  betType: BetType
): Promise<MatchAnalysis[]> => {
  const prompt = `
    Aşağıda sana JSON formatında, maçlar hakkında %100 doğru ve canlı istatistiksel veriler sunuyorum.
    Bu veriler şunları içerir: takımlar arası geçmiş maçlar (H2H), takımların son form durumları ve önemli sakat/cezalı oyuncular.

    SENİN GÖREVİN:
    SADECE VE SADECE sana sağlanan bu yapılandırılmış JSON verilerini kullanarak, her bir maç için "${betType}" bahis türüne yönelik bir analiz yapmaktır.
    
    Analizini yaparken şu adımları izle:
    1. H2H sonuçlarını değerlendir. Hangi takımın üstünlüğü var? Maçlar genellikle gollü mü geçiyor?
    2. Takımların son 10 maçlık form durumunu (galibiyet, mağlubiyet, atılan/yenilen goller) analiz et.
    3. Varsa, kilit oyuncuların sakatlıklarının veya cezalarının maçın sonucuna olası etkisini yorumla.
    4. Tüm bu verilere dayanarak, "${betType}" bahsi için mantıklı bir TAHMİN, bu tahmine olan GÜVEN SEVİYESİ ('Low', 'Medium', 'High') ve bu sonuca nasıl ulaştığını açıklayan detaylı bir GEREKÇE oluştur.

    Çıktın, her maç için bir nesne içeren bir JSON dizisi olmalıdır.
    
    İşte analiz etmen gereken veriler:
    ${JSON.stringify(matchData, null, 2)}
  `;

  const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

  const cleanedJsonText = response.text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
  return JSON.parse(cleanedJsonText) as MatchAnalysis[];
};
