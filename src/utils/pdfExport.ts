import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exports the standings table to PDF.
 * Uses html2canvas to render Chinese characters as images since jsPDF 
 * standard fonts do not support them.
 */
export async function exportStandingsToPDF(t: (key: string) => string) {
    const tableIdentifier = 'standings-table';
    const element = document.getElementById(tableIdentifier);

    if (!element) {
        alert('Table element not found');
        return;
    }

    // Create a temporary container for the PDF content to ensure proper styling
    const printContainer = document.createElement('div');
    printContainer.style.position = 'absolute';
    printContainer.style.left = '-9999px';
    printContainer.style.top = '0';
    printContainer.style.width = '800px';
    printContainer.style.backgroundColor = '#ffffff';
    printContainer.style.color = '#000000';
    printContainer.style.padding = '20px';
    printContainer.style.fontFamily = 'sans-serif';

    // Add Title
    const title = document.createElement('h1');
    title.innerText = t('pdf.title');
    title.style.fontSize = '24px';
    title.style.marginBottom = '10px';
    printContainer.appendChild(title);

    // Add Generated Time
    const meta = document.createElement('p');
    meta.innerText = `${t('pdf.generated')} ${new Date().toLocaleString()}`;
    meta.style.fontSize = '12px';
    meta.style.marginBottom = '20px';
    meta.style.color = '#666666';
    printContainer.appendChild(meta);

    // Clone the table to avoid affecting the UI
    const tableClone = element.cloneNode(true) as HTMLElement;
    tableClone.style.width = '100%';
    tableClone.style.borderCollapse = 'collapse';
    tableClone.style.color = '#000000';
    tableClone.style.backgroundColor = '#ffffff';
    
    // Clean up clone (remove interactive elements like kebab icons)
    const kebabIcons = tableClone.querySelectorAll('.kebab-icon');
    kebabIcons.forEach(icon => icon.remove());
    
    // Reset any glassmorphism or dark modes styles for the PDF
    const cells = tableClone.querySelectorAll('th, td');
    cells.forEach(cell => {
        const c = cell as HTMLElement;
        c.style.border = '1px solid #dddddd';
        c.style.padding = '8px';
        c.style.backgroundColor = '#ffffff';
        c.style.color = '#000000';
    });

    // Special styling for headers
    const headers = tableClone.querySelectorAll('thead th');
    headers.forEach(header => {
        const h = header as HTMLElement;
        h.style.backgroundColor = '#f3f4f6';
        h.style.fontWeight = 'bold';
    });

    const footers = tableClone.querySelectorAll('tfoot th');
    footers.forEach(footer => {
        const f = footer as HTMLElement;
        f.style.backgroundColor = '#f3f4f6';
        f.style.fontWeight = 'bold';
    });

    printContainer.appendChild(tableClone);
    document.body.appendChild(printContainer);

    try {
        const canvas = await html2canvas(printContainer, {
            scale: 2, // Higher resolution
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth() - 28; // Padding
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 14, 14, pdfWidth, pdfHeight);
        pdf.save('tractor-scores.pdf');
    } catch (error) {
        console.error('PDF generation failed:', error);
        alert('Failed to generate PDF');
    } finally {
        document.body.removeChild(printContainer);
    }
}
