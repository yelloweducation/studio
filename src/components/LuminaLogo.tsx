import Link from 'next/link';
import { BookOpenText } from 'lucide-react';

const LuminaLogo = () => {
  return (
    <Link href="/" className="flex items-center space-x-2 text-xl font-bold font-headline text-primary hover:text-primary/80 transition-colors">
      <BookOpenText size={26} />
      <span>Yellow Institute</span>
    </Link>
  );
};

export default LuminaLogo;
