import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CsvExportService {

    exportOrders(orders: any[], filename: string = 'orders.csv'): void {
        if (!orders || orders.length === 0) {
            alert('No hay pedidos para exportar');
            return;
        }

        // Define CSV headers
        const headers = [
            'ID Pedido',
            'Fecha',
            'Nombre Cliente',
            'DNI',
            'Teléfono',
            'Método Entrega',
            'Dirección',
            'Productos',
            'Subtotal',
            'Descuento',
            'Total',
            'Estado'
        ];

        // Convert orders to CSV rows
        const rows = orders.map(order => {
            const items = order.items?.map((item: any) =>
                `${item.quantity}x ${item.productTitle} (S/${item.productPrice})`
            ).join('; ') || '';

            return [
                order.id || '',
                new Date(order.createdAt).toLocaleString('es-PE'),
                order.customerName || '',
                order.customerDni || '',
                order.customerPhone || '',
                order.deliveryMethod === 'PICKUP' ? 'Recojo' : 'Delivery',
                order.deliveryAddress || 'N/A',
                items,
                order.subtotal || 0,
                order.discount || 0,
                order.total || 0,
                this.translateStatus(order.status)
            ];
        });

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Create blob and trigger download
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    private translateStatus(status: string): string {
        const translations: { [key: string]: string } = {
            'PENDING': 'Pendiente',
            'CONFIRMED': 'Confirmado',
            'COMPLETED': 'Completado',
            'CANCELLED': 'Cancelado'
        };
        return translations[status] || status;
    }
}
