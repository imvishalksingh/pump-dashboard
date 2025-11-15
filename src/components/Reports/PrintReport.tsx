// components/Reports/PrintReport.tsx
import { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useReactToPrint } from 'react-to-print';

interface PrintReportProps {
  title: string;
  data: any[];
  columns: any[];
  summary?: any;
  children?: React.ReactNode;
}

export const PrintReport = ({ title, data, columns, summary, children }: PrintReportProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    documentTitle: title,
    pageStyle: `
      @media print {
        body { 
          -webkit-print-color-adjust: exact; 
          font-family: Arial, sans-serif;
        }
        .print-section { 
          margin: 0; 
          padding: 20px; 
        }
        .no-print { display: none !important; }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          font-size: 12px;
        }
        th { 
          background-color: #f8f9fa !important; 
          border: 1px solid #dee2e6; 
          padding: 8px; 
          text-align: left;
          font-weight: bold;
        }
        td { 
          border: 1px solid #dee2e6; 
          padding: 8px; 
        }
        .summary-card {
          border: 1px solid #dee2e6;
          padding: 15px;
          margin-bottom: 20px;
          background-color: #f8f9fa;
        }
      }
    `,
  } as any);

  return (
    <>
      <Button 
        onClick={handlePrint} 
        variant="outline" 
        className="no-print"
      >
        <Printer className="w-4 h-4 mr-2" />
        Print
      </Button>

      <div style={{ display: 'none' }}>
        <div ref={contentRef} className="print-section">
          <h1 style={{ fontSize: '24px', marginBottom: '10px', textAlign: 'center' }}>
            {title}
          </h1>
          
          <div style={{ fontSize: '12px', textAlign: 'center', marginBottom: '20px', color: '#666' }}>
            Generated on: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </div>

          {summary && (
            <div className="summary-card">
              <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Summary</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {Object.entries(summary).map(([key, value]) => (
                  <div key={key} style={{ padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#666' }}>
                      {key}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                      {typeof value === 'number' 
                        ? value.toLocaleString() 
                        : String(value)
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {children || (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th 
                      key={column.key} 
                      style={{ 
                        border: '1px solid #dee2e6', 
                        padding: '8px', 
                        textAlign: 'left',
                        backgroundColor: '#f8f9fa',
                        fontWeight: 'bold'
                      }}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index}>
                    {columns.map((column) => (
                      <td 
                        key={column.key}
                        style={{ 
                          border: '1px solid #dee2e6', 
                          padding: '8px' 
                        }}
                      >
                        {column.render ? column.render(row) : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};