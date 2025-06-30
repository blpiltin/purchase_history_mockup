/**
 * Project: MIS 5350 Final Exam – Purchase History UI
 * File: script.js
 * Author: Brian Piltin
 * Description:
 *   Client-side JavaScript functionality for the Orders page.
 *   Handles:
 *     - Loading purchase data from CSV
 *     - Filtering by date range and category
 *     - Displaying a scrollable table of results
 *     - Exporting data to CSV and PDF formats
 *
 * Libraries Used:
 *   - PapaParse (CSV parsing)
 *   - jsPDF + AutoTable (PDF export)
 *   - Flatpickr (date picker)
 *
 * Created: June 2025
 * License: MIT-style (educational use)
 * 
 * Attributions:
 *   Assisted by OpenAI ChatGPT (2024) for development guidance and code generation.
 */

let purchases = [];
let filtered = [];

function loadCSV() {
   fetch('data/mock_purchases.csv')
      .then(response => response.text())
      .then(csv => {
         const result = Papa.parse(csv, { header: true });
         purchases = result.data;
         // Filter out any rows that do not have the required fields
         purchases = purchases.filter(p => p.Date && p.Merchant && p.Amount && p.Category);
         displayData(purchases);
      });
}

function displayData(data) {
   const tableBody = document.getElementById('purchaseTableBody');
   tableBody.innerHTML = '';
   if (!data.length) {
      document.getElementById('noResults').classList.remove('d-none');
      return;
   } else {
      document.getElementById('noResults').classList.add('d-none');
   }

   data.forEach(p => {
      const row = `<tr>
      <td>${p.Date}</td>
      <td>${p.Merchant}</td>
      <td>$${p.Amount}</td>
      <td>${p.Category}</td>
    </tr>`;
      tableBody.innerHTML += row;
   });
}

function filterData() {
   const start = new Date(document.getElementById('startDate').value);
   const end = new Date(document.getElementById('endDate').value);
   const selectedCategory = document.getElementById('categoryFilter').value;

   filtered = purchases.filter(p => {
      const [year, month, day] = p.Date.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      const dateInRange = (!isNaN(start) && !isNaN(end)) ? (date >= start && date <= end) : true;
      const categoryMatch = selectedCategory ? p.Category === selectedCategory : true;
      return dateInRange && categoryMatch;
   });

   displayData(filtered);
}

function exportCSV() {
   const dataToExport = filtered.length ? filtered : purchases;
   const csv = Papa.unparse(dataToExport);
   const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
   const link = document.createElement('a');
   link.href = URL.createObjectURL(blob);
   link.download = 'filtered_purchases.csv';
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
}

async function exportPDF() {
   const { jsPDF } = window.jspdf;
   const doc = new jsPDF();

   const dataToExport = filtered.length ? filtered : purchases;

   const tableData = dataToExport.map(p => [
      p.Date, p.Merchant, `$${p.Amount}`, p.Category
   ]);

   doc.text("Purchase History", 14, 15);
   doc.autoTable({
      head: [["Date", "Merchant", "Amount", "Category"]],
      body: tableData,
      startY: 20,
      styles: { fontSize: 10 }
   });

   doc.save("purchase_history.pdf");
}

window.onload = () => {
   flatpickr("#startDate", {});
   flatpickr("#endDate", {});
   loadCSV();
};
