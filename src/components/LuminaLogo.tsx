
import Link from 'next/link';
import { BookOpenText } from 'lucide-react';

const LuminaLogo = () => {
  return (
    <Link href="/" className="flex items-center space-x-2 text-xl font-bold font-headline text-foreground hover:text-foreground/70 transition-colors">
      <BookOpenText size={24} /> {/* Adjusted size slightly to balance with potentially bolder text */}
      <span>
        Yellow Institute
      </span>
    </Link>
  );
};

export default LuminaLogo;
