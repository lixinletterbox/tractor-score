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
    const title = document.createElement('h2');
    title.innerText = t('pdf.title');
    title.style.fontSize = '26px';
    title.style.marginBottom = '10px';
    title.style.color = '#000000'; // Pure black for better legibility
    title.style.webkitTextFillColor = '#000000'; // Override any transparent gradients from CSS
    title.style.background = 'none'; // Ensure no gradient background is inherited
    printContainer.appendChild(title);

    // Add Generated Time
    const meta = document.createElement('p');
    meta.innerText = `${t('pdf.generated')} ${new Date().toLocaleString()}`;
    meta.style.fontSize = '12px';
    meta.style.marginBottom = '25px';
    meta.style.color = '#000000'; // Even lighter for meta
    printContainer.appendChild(meta);

    // Clone the table to avoid affecting the UI
    const tableClone = element.cloneNode(true) as HTMLElement;
    tableClone.removeAttribute('id'); // Remove ID from clone
    tableClone.style.width = '100%';
    tableClone.style.borderCollapse = 'collapse';
    tableClone.style.color = '#000000';
    tableClone.style.backgroundColor = '#ffffff';
    tableClone.style.tableLayout = 'fixed'; // Ensure consistent column widths

    // 1. Remove the footer (the redundant player names at the bottom)
    const tfoot = tableClone.querySelector('tfoot');
    if (tfoot) tfoot.remove();

    // 2. Clean up clone (remove interactive elements like kebab icons)
    const kebabIcons = tableClone.querySelectorAll('.kebab-icon');
    kebabIcons.forEach(icon => icon.remove());

    // 3. Reset any glassmorphism, dark modes, or sticky styles for the PDF
    const allElements = tableClone.querySelectorAll('*');
    allElements.forEach(el => {
        const e = el as HTMLElement;
        e.style.position = 'static'; // Remove sticky/absolute positioning
        e.style.backdropFilter = 'none';
        e.style.boxShadow = 'none';
        e.style.textShadow = 'none'; // Explicitly remove shadows for readability
        e.style.transition = 'none';
        e.style.transform = 'none';
    });

    const cells = tableClone.querySelectorAll('th, td');
    cells.forEach(cell => {
        const c = cell as HTMLElement;
        c.style.border = '1px solid #333333'; // Darker border for clarity
        c.style.padding = '10px 5px';
        c.style.backgroundColor = '#ffffff';
        c.style.color = '#000000';
        c.style.textAlign = 'center';
        c.style.fontSize = '13px'; // Slightly larger base font
    });

    // Special styling for headers (Player names)
    const headers = tableClone.querySelectorAll('thead th');
    headers.forEach(header => {
        const h = header as HTMLElement;
        h.style.backgroundColor = '#f9fafb';
        h.style.fontWeight = 'bold';
        h.style.fontSize = '16px'; // Larger font for players
        h.style.borderBottom = '2px solid #000000'; // Thicker bottom border for header
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
        const fileName = 'tractor-scores-' + new Date().toISOString().slice(0, 10);

        pdf.addImage(imgData, 'PNG', 14, 14, pdfWidth, pdfHeight);
        pdf.save(fileName);
    } catch (error) {
        console.error('PDF generation failed:', error);
        alert('Failed to generate PDF');
    } finally {
        document.body.removeChild(printContainer);
    }
}
