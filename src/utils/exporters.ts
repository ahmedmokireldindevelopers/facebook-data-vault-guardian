
import secureStorage from './storage';
import { toast } from "@/hooks/use-toast";

export interface ExportOptions {
  type: 'all' | 'friends' | 'messages' | 'posts' | 'groups';
  format: 'csv' | 'json' | 'text';
}

export class DataExporter {
  // Export data
  static async exportData(options: ExportOptions): Promise<void> {
    try {
      // Get data from storage
      const allData = await secureStorage.getAllData();
      
      // Filter data by type if needed
      const dataToExport = options.type === 'all' 
        ? allData
        : allData.filter(item => item.type === options.type.slice(0, -1)); // Remove 's' from type
      
      if (dataToExport.length === 0) {
        toast({
          title: "No Data to Export",
          description: "There is no data matching your export criteria.",
          variant: "destructive",
        });
        return;
      }
      
      // Format and download data
      switch (options.format) {
        case 'csv':
          await this.exportCsv(dataToExport);
          break;
        case 'json':
          await this.exportJson(dataToExport);
          break;
        case 'text':
          await this.exportText(dataToExport);
          break;
      }
      
      toast({
        title: "Export Complete",
        description: `Successfully exported ${dataToExport.length} records.`,
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export data.",
        variant: "destructive",
      });
    }
  }
  
  // Export as CSV
  private static async exportCsv(data: any[]): Promise<void> {
    if (data.length === 0) return;
    
    try {
      // Collect all possible headers from all records
      const headers = new Set<string>();
      data.forEach(record => {
        Object.keys(record).forEach(key => {
          if (key !== 'data') headers.add(key);
        });
        if (record.data) {
          Object.keys(record.data).forEach(key => {
            headers.add(`data.${key}`);
          });
        }
      });
      
      // Create CSV header row
      const headerRow = Array.from(headers).join(',');
      
      // Create data rows
      const rows = data.map(record => {
        return Array.from(headers).map(header => {
          if (header.startsWith('data.')) {
            const dataKey = header.substring(5);
            const value = record.data && record.data[dataKey];
            return this.formatCsvValue(value);
          } else {
            return this.formatCsvValue(record[header]);
          }
        }).join(',');
      });
      
      // Combine header and rows
      const csv = [headerRow, ...rows].join('\n');
      
      // Download file
      this.downloadFile(csv, 'facebook-data-export.csv', 'text/csv');
    } catch (error) {
      console.error('Error creating CSV:', error);
      throw error;
    }
  }
  
  // Format value for CSV
  private static formatCsvValue(value: any): string {
    if (value === undefined || value === null) return '';
    if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
    if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
    return String(value);
  }
  
  // Export as JSON
  private static async exportJson(data: any[]): Promise<void> {
    const json = JSON.stringify(data, null, 2);
    this.downloadFile(json, 'facebook-data-export.json', 'application/json');
  }
  
  // Export as plain text
  private static async exportText(data: any[]): Promise<void> {
    // Extract IDs and names (if available)
    const lines = data.map(item => {
      return item.name ? `${item.id}: ${item.name}` : item.id;
    });
    
    const text = lines.join('\n');
    this.downloadFile(text, 'facebook-data-export.txt', 'text/plain');
  }
  
  // Helper to download file
  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }
}
