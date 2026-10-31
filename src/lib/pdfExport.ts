import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function downloadElementAsPDF(
  element: HTMLElement | null,
  filename: string,
  onProgress?: (isGenerating: boolean) => void
): Promise<boolean> {
  if (!element) {
    window.print();
    return false;
  }

  if (onProgress) onProgress(true);

  try {
    // High-resolution canvas capture with standard A4 aspect
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: Math.max(element.scrollWidth, 1024),
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
    heightLeft -= pageHeight;

    // Subsequent pages if proposal exceeds 1 A4 page
    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pageHeight;
    }

    const safeName = (filename || "Proposal")
      .replace(/[^a-zA-Z0-9_\-\s]/g, "")
      .trim()
      .replace(/\s+/g, "_");

    pdf.save(`${safeName}.pdf`);
    return true;
  } catch (error) {
    console.error("PDF generation failed, falling back to window.print():", error);
    window.print();
    return false;
  } finally {
    if (onProgress) onProgress(false);
  }
}

