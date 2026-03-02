interface VendorPortalLinkProps {
  vendorName: string;
  portalUrl?: string;
}

export function VendorPortalLink({ vendorName, portalUrl }: VendorPortalLinkProps) {
  if (!portalUrl) {
    return <span className="text-slate-500">{vendorName}</span>;
  }

  return (
    <a
      href={portalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 hover:underline"
    >
      <span>{vendorName}</span>
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    </a>
  );
}
