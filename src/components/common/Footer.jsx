export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4">Hotfix ServiceDesk</h3>
            <p className="text-gray-300 mb-4">
              Enterprise-grade IT service management platform designed for efficient ticket resolution and team collaboration.
            </p>
            <p className="text-sm text-gray-400">
              © 2025 Hotfix ServiceDesk. All rights reserved.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Dashboard</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Create Ticket</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Reports</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact IT</a></li>
              <li><a href="#" className="hover:text-white transition-colors">System Status</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-gray-400">
            Version 2.0.0 | Last updated: October 2025
          </div>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}