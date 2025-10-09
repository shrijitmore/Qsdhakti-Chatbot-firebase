import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface TableDisplayProps {
  title: string;
  headers: string[];
  rows: (string | number)[][];
}

export function TableDisplay({ title, headers, rows }: TableDisplayProps) {
  return (
    <Card className="w-full max-w-full overflow-hidden">
        <CardHeader>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="relative w-full overflow-auto rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                        {headers.map((header, index) => (
                            <TableHead key={index}>{header}</TableHead>
                        ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                            <TableCell key={cellIndex}>{cell}</TableCell>
                            ))}
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  )
}
