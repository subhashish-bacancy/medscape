import { jsPDF } from "jspdf";
import QRCode from "qrcode";

type CertificatePdfInput = {
  recipientName: string;
  trainingName: string;
  scoreText: string;
  trainingTypeLabel?: "training module" | "training program";
  completionDate: string;
  certificateIdText: string;
  verificationUrl?: string;
};

function centerText(
  pdf: jsPDF,
  text: string,
  y: number,
  options?: {
    fontSize?: number;
    fontStyle?: "normal" | "bold";
    color?: [number, number, number];
  },
) {
  if (options?.fontSize) {
    pdf.setFontSize(options.fontSize);
  }

  pdf.setFont("helvetica", options?.fontStyle ?? "normal");

  if (options?.color) {
    pdf.setTextColor(options.color[0], options.color[1], options.color[2]);
  } else {
    pdf.setTextColor(32, 38, 56);
  }

  const pageWidth = pdf.internal.pageSize.getWidth();
  pdf.text(text, pageWidth / 2, y, { align: "center" });
}

function drawWrappedCenterText(
  pdf: jsPDF,
  text: string,
  y: number,
  maxWidth: number,
  options?: {
    fontSize?: number;
    fontStyle?: "normal" | "bold";
    lineHeight?: number;
    color?: [number, number, number];
  },
) {
  if (options?.fontSize) {
    pdf.setFontSize(options.fontSize);
  }

  pdf.setFont("helvetica", options?.fontStyle ?? "normal");

  if (options?.color) {
    pdf.setTextColor(options.color[0], options.color[1], options.color[2]);
  } else {
    pdf.setTextColor(32, 38, 56);
  }

  const lines = pdf.splitTextToSize(text, maxWidth);
  const lineHeight = options?.lineHeight ?? 18;
  const pageWidth = pdf.internal.pageSize.getWidth();

  lines.forEach((line: string, index: number) => {
    pdf.text(line, pageWidth / 2, y + index * lineHeight, { align: "center" });
  });

  return y + lines.length * lineHeight;
}

export async function buildCompletionCertificatePdf(
  input: CertificatePdfInput,
): Promise<ArrayBuffer> {
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;

  pdf.setFillColor(250, 248, 243);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  // Light watermark for branding without reducing readability.
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(96);
  pdf.setTextColor(240, 236, 229);
  pdf.text("MedScape", centerX, pageHeight / 2 + 10, {
    align: "center",
    angle: 20,
  });

  pdf.setDrawColor(23, 92, 82);
  pdf.setLineWidth(2.2);
  pdf.rect(28, 28, pageWidth - 56, pageHeight - 56);
  pdf.setLineWidth(0.8);
  pdf.rect(40, 40, pageWidth - 80, pageHeight - 80);

  centerText(pdf, "CERTIFICATE OF COMPLETION", 110, {
    fontSize: 34,
    fontStyle: "bold",
    color: [23, 54, 79],
  });
  centerText(pdf, "Certification by MedScape", 138, {
    fontSize: 14,
    color: [45, 78, 102],
  });

  pdf.setDrawColor(23, 92, 82);
  pdf.setLineWidth(1.2);
  pdf.line(centerX - 170, 152, centerX + 170, 152);

  centerText(pdf, "This is to certify that", 196, {
    fontSize: 16,
    color: [61, 72, 92],
  });
  centerText(pdf, input.recipientName, 238, {
    fontSize: 40,
    fontStyle: "bold",
    color: [20, 34, 56],
  });

  centerText(
    pdf,
    `has successfully completed the ${input.trainingTypeLabel ?? "training module"}`,
    275,
    {
      fontSize: 16,
      color: [61, 72, 92],
    },
  );
  const trainingEndY = drawWrappedCenterText(
    pdf,
    input.trainingName,
    309,
    pageWidth - 280,
    {
      fontSize: 26,
      fontStyle: "bold",
      lineHeight: 28,
      color: [18, 60, 88],
    },
  );

  centerText(pdf, "with a score of", trainingEndY + 16, {
    fontSize: 16,
    color: [61, 72, 92],
  });
  centerText(pdf, input.scoreText, trainingEndY + 48, {
    fontSize: 28,
    fontStyle: "bold",
    color: [13, 110, 82],
  });

  centerText(pdf, `Completion Date: ${input.completionDate}`, pageHeight - 98, {
    fontSize: 14,
    color: [61, 72, 92],
  });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.setTextColor(52, 66, 86);

  const signatureY = pageHeight - 72;
  pdf.line(90, signatureY, 280, signatureY);
  pdf.text("Authorized Signature", 185, signatureY + 16, { align: "center" });

  centerText(pdf, "MedScape Training Platform", pageHeight - 56, {
    fontSize: 12,
    fontStyle: "bold",
    color: [37, 57, 78],
  });

  pdf.text(`Certificate ID: ${input.certificateIdText}`, pageWidth - 70, pageHeight - 56, {
    align: "right",
  });

  if (input.verificationUrl) {
    const qrSize = 68;
    const qrX = pageWidth - 142;
    const qrY = pageHeight - 144;

    let qrImageDataUrl: string | null = null;

    try {
      qrImageDataUrl = await QRCode.toDataURL(input.verificationUrl, {
        margin: 0,
        width: 256,
        color: {
          dark: "#1E3A5F",
          light: "#F9F8F3",
        },
      });
    } catch {
      qrImageDataUrl = null;
    }

    if (qrImageDataUrl) {
      pdf.addImage(qrImageDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
    }
  }

  return pdf.output("arraybuffer");
}
