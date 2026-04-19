interface SummaryCardProps {
  label: string;
  amount: string;
  caption?: string;
  highlight?: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  label,
  amount,
  caption,
  highlight = false,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p
        className={`mt-2 text-2xl font-bold ${highlight ? 'text-[#CC5500]' : 'text-gray-900'}`}
      >
        {amount}
      </p>
      {caption && <p className="mt-1 text-xs text-gray-500">{caption}</p>}
    </div>
  );
};

export default SummaryCard;
