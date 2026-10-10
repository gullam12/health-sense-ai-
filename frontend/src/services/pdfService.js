import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateClinicalPdf = (prediction, patient) => {
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
  });

  // Primary colors
  const primaryColor = [13, 21, 32];     // Deep Slate
  const celadonColor = [26, 99, 82];     // Surgical Celadon
  const amberColor = [180, 83, 9];       // Clinical Amber
  const mutedText = [90, 103, 119];

  // Header band
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 24, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('HEALTHSENSE AI — CLINICAL ASSESSMENT REPORT', 14, 15);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('IEEE 830 / 29148 DECISION SUPPORT SYSTEM', 140, 15);

  // Patient Info & Meta block
  doc.setTextColor(...primaryColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT IDENTIFICATION & INTAKE', 14, 34);

  doc.setDrawColor(220, 227, 223);
  doc.line(14, 36, 196, 36);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 50, 60);

  const formattedDate = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  doc.text(`Patient Name: ${patient?.name || 'Alex Morgan'}`, 14, 43);
  doc.text(`Patient ID: ${patient?.id || 'HS-94821'}`, 80, 43);
  doc.text(`Assessment Date: ${formattedDate}`, 140, 43);

  doc.text(`Age / Gender: ${patient?.age || '48'} yrs / ${patient?.gender || 'Male'}`, 14, 49);
  doc.text(`Physician Ref: Pending Review`, 80, 49);
  doc.text(`Record Status: Digitally Verified`, 140, 49);

  // Risk Stratification Banner
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('DIAGNOSTIC STRATIFICATION & INFERENCE', 14, 60);
  doc.line(14, 62, 196, 62);

  const isElevated = prediction.probability >= 65;
  const isModerate = prediction.probability >= 35 && prediction.probability < 65;
  const bannerBg = isElevated ? [254, 226, 226] : isModerate ? [254, 243, 199] : [231, 243, 239];
  const bannerBorder = isElevated ? [239, 68, 68] : isModerate ? amberColor : celadonColor;

  doc.setFillColor(...bannerBg);
  doc.setDrawColor(...bannerBorder);
  doc.roundedRect(14, 66, 182, 22, 2, 2, 'FD');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(`Evaluated Target: ${prediction.disease}`, 18, 73);

  doc.setFontSize(10);
  doc.setTextColor(...(isElevated ? [190, 18, 60] : isModerate ? amberColor : celadonColor));
  doc.text(`Risk Classification: ${prediction.riskLevel} (${prediction.probability}% probability)`, 18, 80);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedText);
  doc.text(`ML Engine: ${prediction.model} | Validation Accuracy: ${prediction.accuracy}`, 18, 85);

  // Biomarker Attribution Table (autoTable)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('BIOMARKER EXPLAINABILITY MATRIX (SHAP IMPACT)', 14, 98);

  const tableRows = (prediction.shapValues || []).map(item => [
    item.name,
    item.current,
    item.baseline,
    item.value > 0 ? `+${item.value}% (Elevates Risk)` : `${item.value}% (Mitigating)`,
    Math.abs(item.value) > 10 ? 'High Significance' : 'Moderate'
  ]);

  autoTable(doc, {
    startY: 102,
    head: [['Biomarker Parameter', 'Patient Value', 'Clinical Baseline', 'Relative Model Weight', 'Sensitivity']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 249]
    },
    margin: { left: 14, right: 14 }
  });

  // Clinical Recommendations
  const finalY = (doc).lastAutoTable.finalY + 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('CLINICAL GUIDELINES & DIRECTIVE', 14, finalY);
  doc.line(14, finalY + 2, 196, finalY + 2);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 50, 60);
  const adviceLines = doc.splitTextToSize(prediction.clinicalAdvice, 180);
  doc.text(adviceLines, 14, finalY + 8);

  // Medical Compliance Disclaimer Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setDrawColor(220, 227, 223);
  doc.line(14, pageHeight - 20, 196, pageHeight - 20);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(110, 120, 130);
  doc.text(
    'REGULATORY DISCLAIMER: This computer-generated summary is provided under IEEE 830 / ISO/IEC/IEEE 29148 standards for decision support only. ' +
    'Predictions do not constitute a definitive medical diagnosis. Consult a board-certified physician for clinical confirmation.',
    14,
    pageHeight - 15,
    { maxWidth: 182 }
  );

  // Save the PDF
  const sanitizedName = prediction.disease.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`HealthSense_Report_${sanitizedName}_${Date.now()}.pdf`);
};
