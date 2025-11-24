import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { ProductTableItem } from "@/types/product";

interface ProductTableProps {
  products: ProductTableItem[];
  onEdit: (product: ProductTableItem) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export const ProductTable = ({ products, onEdit, onDelete, loading = false }: ProductTableProps) => {
  const getStatusVariant = (status: string) => {
    return status === "Active" ? "default" : "secondary";
  };

  const getTypeVariant = (type: string) => {
    const typeColors: { [key: string]: string } = {
      Petrol: "bg-blue-100 text-blue-800 border-blue-200",
      Diesel: "bg-green-100 text-green-800 border-green-200",
      CNG: "bg-purple-100 text-purple-800 border-purple-200",
      Lubricant: "bg-orange-100 text-orange-800 border-orange-200",
      Accessory: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return typeColors[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span className="ml-2">Loading products...</span>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Current Price</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!products || products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No products found
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product._id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`${getTypeVariant(product.type)} border`}
                  >
                    {product.type}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold">
                  ₹{(product.currentPrice || 0).toFixed(2)}
                </TableCell>
                <TableCell>{product.unit}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(product.status || "Active")}>
                    {product.status || "Active"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {product.lastUpdated ? new Date(product.lastUpdated).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  }) : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onEdit(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => onDelete(product._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};