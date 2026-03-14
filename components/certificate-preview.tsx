import QRCode from "qrcode";

type CertificatePreviewProps = {
  certificateId: string;
  completionDate: string;
  recipientName: string;
  scoreText: string;
  trainingName: string;
  trainingTypeLabel: "training module" | "training program";
  verificationUrl: string;
};

export async function CertificatePreview({
  certificateId,
  completionDate,
  recipientName,
  scoreText,
  trainingName,
  trainingTypeLabel,
  verificationUrl,
}: CertificatePreviewProps) {
  let qrDataUrl: string | null = null;

  try {
    qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      margin: 0,
      width: 220,
      color: {
        dark: "#1E3A5F",
        light: "#F9F8F3",
      },
    });
  } catch {
    qrDataUrl = null;
  }

  return (
    <section className="rounded-[2.5rem] border border-[var(--border)] bg-[var(--panel-strong)] p-6 shadow-[0_26px_70px_rgba(23,32,43,0.1)] lg:p-8">
      <div className="relative overflow-hidden rounded-[2rem] bg-[#faf7f1] p-6 lg:p-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-4 rounded-[1.6rem] border-2 border-[#175c52]" />
          <div className="absolute inset-7 rounded-[1.3rem] border border-[#175c52]/50" />
          <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[18deg] text-7xl font-semibold tracking-tight text-[#efe9de]">
            MedScape
          </p>
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-4 pb-20 pt-6 text-center">
          <p className="text-3xl font-semibold tracking-[0.08em] text-[#17364f] sm:text-4xl">
            CERTIFICATE OF COMPLETION
          </p>
          <p className="mt-2 text-sm font-medium tracking-[0.18em] text-[#2d4e66] uppercase">
            Certification by MedScape
          </p>
          <div className="mt-4 h-px w-60 bg-[#175c52]" />

          <p className="mt-10 text-base text-[#3d485c]">This is to certify that</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-[#142238] sm:text-5xl">
            {recipientName}
          </p>

          <p className="mt-8 text-base text-[#3d485c]">
            has successfully completed the {trainingTypeLabel}
          </p>
          <p className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight text-[#123c58] sm:text-3xl">
            {trainingName}
          </p>

          <p className="mt-8 text-base text-[#3d485c]">with a score of</p>
          <p className="mt-2 text-3xl font-semibold text-[#0d6e52]">{scoreText}</p>

          <p className="mt-8 text-sm text-[#3d485c]">Completion Date: {completionDate}</p>
        </div>

        <div className="relative z-10 mt-2 grid gap-4 border-t border-[#dcd3c1] px-5 pb-5 pt-4 text-sm text-[#344256] sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <div className="min-w-[200px]">
            <div className="h-px w-44 bg-[#6f7786]" />
            <p className="mt-2">Authorized Signature</p>
          </div>

          <p className="font-semibold sm:justify-self-center">
            MedScape Training Platform
          </p>

          <div className="flex items-end gap-4 sm:justify-self-end">
            <p className="font-medium">Certificate ID: {certificateId}</p>
            {qrDataUrl ? (
              <img
                alt="Certificate verification QR code"
                className="h-16 w-16 rounded-sm border border-[#d6dcea] bg-white p-1"
                height={64}
                src={qrDataUrl}
                width={64}
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
