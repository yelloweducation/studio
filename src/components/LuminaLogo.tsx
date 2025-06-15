
import React from 'react'; // Added React import
import Link from 'next/link';
import { Circle } from 'lucide-react'; // Changed from BookOpenText

const LuminaLogo = React.memo(() => { // Wrapped with React.memo
  return (
    <Link href="/" className="flex items-center space-x-2 text-xl font-bold font-headline text-foreground hover:text-foreground/70 transition-colors">
      <Circle size={24} className="text-primary" /> {/* Changed icon and applied primary color */}
      <span>
        Yellow Institute
      </span>
    </Link>
  );
});

LuminaLogo.displayName = 'LuminaLogo'; // Added displayName

export default LuminaLogo;
