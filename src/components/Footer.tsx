const Footer = () => {
  return (
    <footer className="bg-muted py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/fc293183-4946-4f6f-9562-6509947cf52e.png" 
                alt="FastClub Logo" 
                className="h-8 sm:h-10"
              />
            </div>

            {/* Contact Info */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base">Email:</span>
                <a 
                  href="mailto:info@fastclub.it" 
                  className="text-sm sm:text-base hover:text-primary transition-colors"
                >
                  info@fastclub.it
                </a>
              </div>
              <div className="text-xs sm:text-sm flex items-center gap-2">
                © 2024 <img src="/lovable-uploads/fc293183-4946-4f6f-9562-6509947cf52e.png" alt="FastClub" className="h-4" />. Tutti i diritti riservati.
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;