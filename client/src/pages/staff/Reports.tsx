import React, { useState, useEffect } from 'react';
import { 
  getPopularServiceTypes, 
  getBusyPeriodsAnalysis, 
  getStaffPerformanceMetrics, 
  getRevenueReporting,
  ServicePopularity,
  BusyPeriodsAnalysis,
  StaffPerformance,
  RevenueReport
} from '../../api/reportingApi';
import { Card } from '../../components/ui';

const Reports: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [popularServices, setPopularServices] = useState<ServicePopularity[]>([]);
  const [busyPeriods, setBusyPeriods] = useState<BusyPeriodsAnalysis | null>(null);
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([]);
  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch all reports in parallel
      const [
        popularServicesData,
        busyPeriodsData,
        staffPerformanceData,
        revenueData
      ] = await Promise.all([
        getPopularServiceTypes(startDate || undefined, endDate || undefined),
        getBusyPeriodsAnalysis(startDate || undefined, endDate || undefined),
        getStaffPerformanceMetrics(startDate || undefined, endDate || undefined),
        getRevenueReporting(startDate || undefined, endDate || undefined)
      ]);
      
      setPopularServices(popularServicesData);
      setBusyPeriods(busyPeriodsData);
      setStaffPerformance(staffPerformanceData);
      setRevenueReport(revenueData);
    } catch (err: any) {
      setError('Failed to fetch reports: ' + (err.response?.data?.error || err.message));
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch reports on mount
  useEffect(() => {
    fetchReports();
  }, []);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Reports & Analytics</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* Date Range Filter */}
      <Card className="mb-6">
        <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Apply Filter'}
            </button>
          </div>
        </form>
      </Card>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Popular Services */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Popular Services</h2>
            {popularServices.length === 0 ? (
              <p className="text-gray-500">No data available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Count
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {popularServices.map((service, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {service.serviceType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {service.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
          
          {/* Staff Performance */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Staff Performance</h2>
            {staffPerformance.length === 0 ? (
              <p className="text-gray-500">No data available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Staff
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completion Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {staffPerformance.map((staff) => (
                      <tr key={staff.staffId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {staff.staffName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {staff.totalAppointments}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {staff.completedAppointments}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {staff.completionRate}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
          
          {/* Busy Periods */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Busy Periods</h2>
            {!busyPeriods ? (
              <p className="text-gray-500">No data available</p>
            ) : (
              <div>
                <h3 className="text-lg font-medium mb-2">By Day of Week</h3>
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {Object.entries(busyPeriods.byDayOfWeek).map(([day, count]) => (
                    <div key={day} className="text-center">
                      <div className="text-sm font-medium text-gray-700">{day.substring(0, 3)}</div>
                      <div 
                        className="bg-blue-500 mx-auto mt-1" 
                        style={{ 
                          height: `${Math.max(20, count * 5)}px`, 
                          width: '20px',
                          borderRadius: '2px'
                        }}
                      ></div>
                      <div className="text-xs text-gray-500 mt-1">{count}</div>
                    </div>
                  ))}
                </div>
                
                <h3 className="text-lg font-medium mb-2">By Hour of Day</h3>
                <div className="flex items-end h-32 space-x-2 mb-6">
                  {Object.entries(busyPeriods.byHourOfDay).map(([hour, count]) => (
                    <div key={hour} className="flex-1 text-center">
                      <div 
                        className="bg-green-500 mx-auto" 
                        style={{ 
                          height: `${Math.max(4, (count / Math.max(...Object.values(busyPeriods.byHourOfDay))) * 100)}%`,
                          borderRadius: '2px'
                        }}
                      ></div>
                      <div className="text-xs text-gray-500 mt-1">{hour}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
          
          {/* Revenue Report */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Revenue Report</h2>
            {!revenueReport ? (
              <p className="text-gray-500">No data available</p>
            ) : (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Total Revenue</h3>
                  <p className="text-3xl font-bold text-green-600">
                    ${revenueReport.totalRevenue.toFixed(2)}
                  </p>
                </div>
                
                <h3 className="text-lg font-medium mb-2">Revenue by Service</h3>
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(revenueReport.revenueByService).map(([service, revenue]) => (
                        <tr key={service}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {service}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${revenue.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default Reports;
