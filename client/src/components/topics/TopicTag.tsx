interface TopicTagProps {
  name: string;
  onRemove?: () => void;
  onClick?: () => void;
  active?: boolean;
}

export default function TopicTag({ name, onRemove, onClick, active }: TopicTagProps) {
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors
        ${onClick ? 'cursor-pointer' : ''}
        ${active
          ? 'bg-blue-600 text-white'
          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
        }`}
    >
      {name}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-1 text-blue-400 hover:text-blue-700 leading-none"
        >
          ×
        </button>
      )}
    </span>
  );
}
