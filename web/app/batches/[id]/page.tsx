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
import { Badge } from "@/components/ui/badge";
import RetryButton from './components/retry-button';

async function getBatch(id: string): Promise<BatchInterface> {
  const response = await fetch(`${API_URL}/batches/${id}`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch batch: ${response.status}`);
  }
  
  return response.json();
}

export default async function BatchDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const batch = await getBatch(id);

  return (
    <div>
      <h1>{batch.name}</h1>
      <p>Segment: {batch.segment}</p>
      <p>Owner: {batch.ownerEmail}</p>
      <p>Status: <Badge>{batch.status}</Badge></p>
      <p>Total: {batch.totalLeads} | Ready: {batch.totalReady} | Failed: {batch.totalFailed}</p>

      <RetryButton batchId={batch.id} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Legal ID</TableHead>
            <TableHead>Legal Name</TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Domain</TableHead>
            <TableHead>Alive</TableHead>
            <TableHead>Fit Score</TableHead>
            <TableHead>Ice Breaker</TableHead>
            <TableHead>Pain</TableHead>
            <TableHead>Error</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {batch.leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>{lead.legalId}</TableCell>
              <TableCell>{lead.normalizedLegalName || lead.legalName}</TableCell>
              <TableCell>{lead.website}</TableCell>
              <TableCell><Badge>{lead.status}</Badge></TableCell>
              <TableCell>{lead.mainDomain || '-'}</TableCell>
              <TableCell>{lead.isWebsiteAlive === null ? '-' : lead.isWebsiteAlive ? 'Yes' : 'No'}</TableCell>
              <TableCell>{lead.prospectFitScore ?? '-'}</TableCell>
              <TableCell>{lead.iceBreaker || '-'}</TableCell>
              <TableCell>{lead.painHypothesis || '-'}</TableCell>
              <TableCell>{lead.errorReason || lead.aiErrorReason || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}