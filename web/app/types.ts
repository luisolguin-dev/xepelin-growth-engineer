export interface LeadInterface {
    id: string;
    legalId: string;
    legalName: string;
    website: string;
    batchId: string;
    status: string;
    errorReason:string | null;
    normalizedLegalName: string | null;
    mainDomain: string | null;
    isWebsiteAlive: boolean | null;
    prospectFitScore: number | null;
    iceBreaker: string | null;
    painHypothesis: string | null;
    aiErrorReason: string | null;
    createdAt: string;
    updatedAt: string;
}


export interface BatchInterface {
    id: string; 
    name: string; 
    segment: string; 
    ownerEmail: string; 
    webhookUrl: string; 
    status: string; 
    leads: LeadInterface[];
    totalLeads: number;
    totalReady: number;
    totalFailed: number;
    processingStartedAt: string | null;
    userId: string | null;
    createdAt: string;
    updatedAt: string;
    
}