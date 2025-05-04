const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold">Portal</h3>
            <p className="text-gray-400">Your Fullstack Application</p>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <a href="#" className="text-gray-400 hover:text-white">About</a>
            <a href="#" className="text-gray-400 hover:text-white">Contact</a>
            <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
          </div>
        </div>
        
        <div className="mt-6 text-center text-gray-400 text-sm">
          &copy; {currentYear} Portal. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
