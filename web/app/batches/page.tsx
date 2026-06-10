import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { API_URL } from "../lib/constants";
import { BatchInterface } from "../types";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";



async function getBatches(): Promise<BatchInterface[]> {
    const response = await fetch(`${API_URL}/batches`, {
        cache: 'no-store'
    });
    return response.json();
}

export default async function BatchesPage() {
  const batches = await getBatches();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0A1628' }}>
          Lead Batches
        </h1>
        <p style={{ color: '#6B7280', marginTop: '0.25rem' }}>
          Pipeline de enriquecimiento de leads
        </p>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <Table>
          <TableHeader>
            <TableRow style={{ background: '#F8FAFC' }}>
              <TableHead style={{ color: '#0A1628', fontWeight: '600' }}>Name</TableHead>
              <TableHead style={{ color: '#0A1628', fontWeight: '600' }}>Segment</TableHead>
              <TableHead style={{ color: '#0A1628', fontWeight: '600' }}>Owner</TableHead>
              <TableHead style={{ color: '#0A1628', fontWeight: '600' }}>Date</TableHead>
              <TableHead style={{ color: '#0A1628', fontWeight: '600' }}>Status</TableHead>
              <TableHead style={{ color: '#0A1628', fontWeight: '600' }}>Total</TableHead>
              <TableHead style={{ color: '#0A1628', fontWeight: '600' }}>Ready</TableHead>
              <TableHead style={{ color: '#0A1628', fontWeight: '600' }}>Failed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.map((batch) => (
              <TableRow key={batch.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                <TableCell>
                  <Link 
                    href={`/batches/${batch.id}`}
                    style={{ color: '#2563EB', fontWeight: '500', textDecoration: 'none' }}
                  >
                    {batch.name}
                  </Link>
                </TableCell>
                <TableCell style={{ color: '#374151' }}>{batch.segment}</TableCell>
                <TableCell style={{ color: '#374151' }}>{batch.ownerEmail}</TableCell>
                <TableCell style={{ color: '#6B7280' }}>{new Date(batch.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge style={{
                    background: batch.status === 'completed' ? '#DCFCE7' : 
                                batch.status === 'processing' ? '#DBEAFE' : 
                                batch.status === 'failed' ? '#FEE2E2' : '#F3F4F6',
                    color: batch.status === 'completed' ? '#166534' : 
                           batch.status === 'processing' ? '#1D4ED8' : 
                           batch.status === 'failed' ? '#DC2626' : '#374151',
                    border: 'none'
                  }}>
                    {batch.status}
                  </Badge>
                </TableCell>
                <TableCell style={{ color: '#374151' }}>{batch.totalLeads}</TableCell>
                <TableCell style={{ color: '#166534', fontWeight: '500' }}>
                  {batch.totalLeads > 0 ? Math.round((batch.totalReady / batch.totalLeads) * 100) : 0}%
                </TableCell>
                <TableCell style={{ color: '#DC2626', fontWeight: '500' }}>
                  {batch.totalLeads > 0 ? Math.round((batch.totalFailed / batch.totalLeads) * 100) : 0}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}