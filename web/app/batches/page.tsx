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

export default async function BatchesPage(){
    const batches = await getBatches(); 

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Segment </TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total </TableHead>
                        <TableHead>Ready</TableHead>
                        <TableHead>Failed</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {batches.map((batch) => (
                        <TableRow key={batch.id}>
                            <TableCell>
                                <Link href={`/batches/${batch.id}`}>{batch.name}</Link>
                            </TableCell>
                            <TableCell>{batch.segment}</TableCell>
                            <TableCell>{batch.ownerEmail}</TableCell>
                            <TableCell>{new Date(batch.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                                <Badge>{batch.status}</Badge>
                            </TableCell>
                            <TableCell>{batch.totalLeads}</TableCell>
                            <TableCell>
                                {batch.totalLeads > 0 
                                ? Math.round((batch.totalReady / batch.totalLeads) * 100) 
                                : 0}%
                            </TableCell>
                            <TableCell>
                                {batch.totalLeads > 0 
                                ? Math.round((batch.totalFailed / batch.totalLeads) * 100) 
                                : 0}%
                            </TableCell>
                        </TableRow>
                        
                    ))}
                </TableBody>



            </Table>
        </div>
    )
}   