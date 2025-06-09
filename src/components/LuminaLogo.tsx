
import Link from 'next/link';
import { BookOpenText } from 'lucide-react';

const LuminaLogo = () => {
  return (
    <Link href="/" className="flex items-center space-x-2 text-xl font-bold font-headline text-primary hover:text-primary-darker transition-colors">
      <BookOpenText size={24} /> {/* Adjusted size slightly to balance with potentially bolder text */}
      <span style={{ textShadow: '1px 1px 0px hsl(var(--primary-darker)), 2px 2px 0px hsl(var(--accent-darker))' }}>
        Yellow Institute
      </span>
    </Link>
  );
};

export default LuminaLogo;
