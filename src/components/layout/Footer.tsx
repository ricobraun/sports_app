import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} CrickPredict. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <p className="text-xs text-gray-500">
              Powered by cricketdata.org API
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;