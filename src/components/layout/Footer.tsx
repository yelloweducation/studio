const Footer = () => {
  return (
    <footer className="bg-card text-center py-6 border-t mt-auto">
      <div className="container mx-auto px-4">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} LuminaLearn. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Empowering minds, one course at a time.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
