import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as cheerio from 'cheerio';
import { Lead } from "../../leads/entities/lead.entity";
import Anthropic from "@anthropic-ai/sdk";


export interface AiEnrichmentResult {
    prospectFitScore: number; 
    prospectFitJustification: string; 
    iceBreaker: string; 
    painHypothesis: string; 
}

@Injectable()
export class AiEnrichmentService {
    constructor(private configService: ConfigService) {}

    async scrapeWebsite(url: string): Promise<string> {
        try {
            const html = await fetch(url, {
                signal: AbortSignal.timeout(5000)
            }).then(r => r.text()); 
            const $ = cheerio.load(html);
            $('script, style, nav, footer').remove();
            const text = $('body').text().replace(/\s+/g, ' ').trim();
            return text.substring(0, 1000);
        } catch {
            return ''
        }
        
    }

    async enrichLead(lead: Lead): Promise<AiEnrichmentResult> {
        const websiteContent = await this.scrapeWebsite(lead.website);

        const context =`
            Company: ${lead.normalizedLegalName}
            Domain: ${lead.mainDomain}
            Website content: ${websiteContent}
        `;

        const client = new Anthropic({
            apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
        });


        const response = await client.messages.create({
            model: 'claude-haiku-4-5-20251001', 
            max_tokens: 1024, 
            messages: [
                {
                    role: 'user', 
                   content: `Eres un asistente de inteligencia comercial B2B para Xepelin, una fintech que ofrece financiamiento, pagos y herramientas de gestión financiera para PyMEs en Chile y México.

                    Analiza la siguiente empresa y responde con un objeto JSON con exactamente esta estructura:
                    {
                    "prospectFitScore": <entero 0-100>,
                    "prospectFitJustification": "<1-2 oraciones explicando el puntaje>",
                    "iceBreaker": "<1-2 oraciones personalizadas que un SDR puede usar para iniciar contacto>",
                    "painHypothesis": "<el pain point más relevante para Xepelin: financiamiento, pagos o gestión financiera>"
                    }

                    Responde ÚNICAMENTE con el objeto JSON. Sin markdown, sin explicaciones, sin backticks.

                    Si no tienes información suficiente sobre la empresa, indícalo con un prospectFitScore bajo (menor a 30) y un iceBreaker genérico.

                    Contexto de la empresa:
                    ${context}`
                }
            ]
        })
        const rawText = response.content[0].type === 'text' 
        ? response.content[0].text 
        : '';
        

        const cleanText = rawText
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        const parsed = JSON.parse(cleanText);


        return {
        prospectFitScore: parsed.prospectFitScore,
        prospectFitJustification: parsed.prospectFitJustification,
        iceBreaker: parsed.iceBreaker,
        painHypothesis: parsed.painHypothesis,
        };
    }

}