import { BatchInterface } from '../../types';
import { API_URL } from '../../lib/constants';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import RetryButton from './components/retry-button';
import Link from 'next/link';

async function getBatch(id: string): Promise<BatchInterface> {
  const response = await fetch(`${API_URL}/batches/${id}`, {
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch batch: ${response.status}`);
  }
  return response.json();
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    ai_ready:   { bg: '#DCFCE7', color: '#166534' },
    ready:      { bg: '#DCFCE7', color: '#166534' },
    completed:  { bg: '#DCFCE7', color: '#166534' },
    processing: { bg: '#DBEAFE', color: '#1D4ED8' },
    ai_enriching: { bg: '#DBEAFE', color: '#1D4ED8' },
    pending:    { bg: '#F3F4F6', color: '#374151' },
    failed:     { bg: '#FEE2E2', color: '#DC2626' },
    ai_failed:  { bg: '#FEE2E2', color: '#DC2626' },
  };
  const style = colors[status] || { bg: '#F3F4F6', color: '#374151' };
  return (
    <Badge style={{ background: style.bg, color: style.color, border: 'none' }}>
      {status}
    </Badge>
  );
}

export default async function BatchDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const batch = await getBatch(id);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      
      <Link href="/batches" style={{ color: '#2563EB', textDecoration: 'none', fontSize: '0.875rem' }}>
        ← Volver a batches
      </Link>

      <div style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0A1628', margin: 0 }}>
              {batch.name}
            </h1>
            <p style={{ color: '#6B7280', marginTop: '0.25rem', fontSize: '0.875rem' }}>
              {batch.segment} · {batch.ownerEmail}
            </p>
          </div>
          <StatusBadge status={batch.status} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '1.25rem' }}>
          <p style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Leads</p>
          <p style={{ fontSize: '2rem', fontWeight: '700', color: '#0A1628', margin: '0.25rem 0 0' }}>{batch.totalLeads}</p>
        </div>
        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '1.25rem' }}>
          <p style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ready</p>
          <p style={{ fontSize: '2rem', fontWeight: '700', color: '#166534', margin: '0.25rem 0 0' }}>
            {batch.totalReady} <span style={{ fontSize: '1rem', color: '#6B7280' }}>
              ({batch.totalLeads > 0 ? Math.round((batch.totalReady / batch.totalLeads) * 100) : 0}%)
            </span>
          </p>
        </div>
        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '1.25rem' }}>
          <p style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Failed</p>
          <p style={{ fontSize: '2rem', fontWeight: '700', color: '#DC2626', margin: '0.25rem 0 0' }}>
            {batch.totalFailed} <span style={{ fontSize: '1rem', color: '#6B7280' }}>
              ({batch.totalLeads > 0 ? Math.round((batch.totalFailed / batch.totalLeads) * 100) : 0}%)
            </span>
          </p>
        </div>
      </div>


      <div style={{ marginBottom: '1.5rem' }}>
        <RetryButton batchId={batch.id} />
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <Table>
          <TableHeader>
            <TableRow style={{ background: '#F8FAFC' }}>
              <TableHead style={{ color: '#0A1628', fontWeight: '600' }}>Legal ID</TableHead>
              <TableHead style={{ color: '#0A1628', fontWeight: '600' }}>Legal Name</TableHead>
              <TableHead style={{ color: '#0A1628', fontWeight: '600' }}>Website</TableHead>
              <TableHead style={{ color: '#0A1628', fontWeight: '600' }}>Status</TableHead>
              <TableHead style={{ color: '#0A1628', fontWeight: '600' }}>Domain</TableHead>
              <TableHead style={{ color: '#0A1628', fontWeight: '600' }}>Alive</TableHead>
              <TableHead style={{ color: '#0A1628', fontWeight: '600' }}>Fit Score</TableHead>
              <TableHead style={{ color: '#0A1628', fontWeight: '600' }}>Fit Reason</TableHead>
              <TableHead style={{ color: '#0A1628', fontWeight: '600' }}>Ice Breaker</TableHead>
              <TableHead style={{ color: '#0A1628', fontWeight: '600' }}>Pain</TableHead>
              <TableHead style={{ color: '#0A1628', fontWeight: '600' }}>Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batch.leads.map((lead) => (
              <TableRow key={lead.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                <TableCell style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{lead.legalId}</TableCell>
                <TableCell style={{ fontWeight: '500', color: '#0A1628' }}>{lead.normalizedLegalName || lead.legalName}</TableCell>
                <TableCell>
                  <a href={lead.website} target="_blank" rel="noopener noreferrer" 
                     style={{ color: '#2563EB', textDecoration: 'none', fontSize: '0.875rem' }}>
                    {lead.website || '-'}
                  </a>
                </TableCell>
                <TableCell><StatusBadge status={lead.status} /></TableCell>
                <TableCell style={{ color: '#6B7280', fontSize: '0.875rem' }}>{lead.mainDomain || '-'}</TableCell>
                <TableCell>
                  {lead.isWebsiteAlive === null ? '-' : 
                   lead.isWebsiteAlive ? 
                   <span style={{ color: '#166534' }}>✓</span> : 
                   <span style={{ color: '#DC2626' }}>✗</span>}
                </TableCell>
                <TableCell>
                  {lead.prospectFitScore !== null ? (
                    <span style={{ 
                      fontWeight: '600',
                      color: lead.prospectFitScore >= 70 ? '#166534' : 
                             lead.prospectFitScore >= 40 ? '#D97706' : '#DC2626'
                    }}>
                      {lead.prospectFitScore}
                    </span>
                  ) : '-'}
                </TableCell>
                <TableCell style={{ maxWidth: '200px' }}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger style={{
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontSize: '0.875rem',
                      color: '#374151',
                      cursor: 'pointer',
                      maxWidth: '200px'
                    }}>
                      {lead.prospectFitJustification || '-'}
                    </TooltipTrigger>
                    <TooltipContent style={{ maxWidth: '300px', whiteSpace: 'normal' }}>
                      {lead.prospectFitJustification || '-'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell style={{ maxWidth: '200px' }}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger style={{
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontSize: '0.875rem',
                      color: '#374151',
                      cursor: 'pointer',
                      maxWidth: '200px'
                    }}>
                      {lead.iceBreaker || '-'}
                    </TooltipTrigger>
                    <TooltipContent style={{ maxWidth: '300px', whiteSpace: 'normal' }}>
                      {lead.iceBreaker || '-'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
                <TableCell style={{ maxWidth: '200px' }}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger style={{
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontSize: '0.875rem',
                        color: '#374151',
                        cursor: 'pointer',
                        maxWidth: '200px'
                      }}>
                        {lead.painHypothesis || '-'}
                      </TooltipTrigger>
                      <TooltipContent style={{ maxWidth: '300px', whiteSpace: 'normal' }}>
                        {lead.painHypothesis || '-'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell style={{ fontSize: '0.875rem', color: '#DC2626' }}>
                  {lead.errorReason || lead.aiErrorReason || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}