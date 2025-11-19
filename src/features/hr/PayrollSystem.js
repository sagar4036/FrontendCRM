import React, { useState } from 'react';
import { Search, ChevronDown, Filter, Download, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';

const PayrollSystem = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [setSelectedEmployee] = useState(null);
  
  const employees = [
    {
      id: 'EMP001',
      name: 'Ethan Walker',
      designation: 'Software Engineer',
      attendance: '20/22',
      attendanceRate: 91,
      grossSalary: '$60,000',
      deductions: '$5,000',
      netSalary: '$55,000',
      avatar: 'EW',
      department: 'Engineering',
      status: 'Active'
    },
    {
      id: 'EMP002',
      name: 'Olivia Barnett',
      designation: 'Product Manager',
      attendance: '21/22',
      attendanceRate: 95,
      grossSalary: '$75,000',
      deductions: '$6,000',
      netSalary: '$69,000',
      avatar: 'OB',
      department: 'Product',
      status: 'Active'
    },
    {
      id: 'EMP003',
      name: 'Noah Carter',
      designation: 'UX Designer',
      attendance: '22/22',
      attendanceRate: 100,
      grossSalary: '$65,000',
      deductions: '$5,500',
      netSalary: '$59,500',
      avatar: 'NC',
      department: 'Design',
      status: 'Active'
    },
    {
      id: 'EMP004',
      name: 'Chloe Foster',
      designation: 'Marketing Specialist',
      attendance: '19/22',
      attendanceRate: 86,
      grossSalary: '$55,000',
      deductions: '$4,500',
      netSalary: '$50,500',
      avatar: 'CF',
      department: 'Marketing',
      status: 'Active'
    }
  ];

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPayroll = employees.reduce((sum, emp) => sum + parseInt(emp.netSalary.replace(/[$,]/g, '')), 0);
  const avgAttendance = employees.reduce((sum, emp) => sum + emp.attendanceRate, 0) / employees.length;

  const getAttendanceColor = (rate) => {
    if (rate >= 95) return '#10b981';
    if (rate >= 85) return '#f59e0b';
    return '#ef4444';
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? '#10b981' : '#ef4444';
  };

  return (
    <div style={{ 
      padding: '32px', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      minHeight: '100vh', 
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' 
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Animated Header */}
        <div style={{ 
          marginBottom: '32px',
          textAlign: 'center',
          animation: 'fadeInUp 0.6s ease-out'
        }}>
          <h1 style={{ 
            fontSize: '42px', 
            fontWeight: '800', 
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 16px 0',
            textShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}>
            ✨ Employee Payroll Dashboard
          </h1>
          <p style={{ 
            fontSize: '18px', 
            color: 'rgba(255, 255, 255, 0.8)', 
            margin: '0',
            fontWeight: '300'
          }}>
            Manage employee salaries with style and precision
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '24px', 
          marginBottom: '32px' 
        }}>
          {[
            { icon: Users, title: 'Total Employees', value: employees.length, color: '#3b82f6' },
            { icon: DollarSign, title: 'Total Payroll', value: `$${totalPayroll.toLocaleString()}`, color: '#10b981' },
            { icon: TrendingUp, title: 'Avg Attendance', value: `${avgAttendance.toFixed(1)}%`, color: '#f59e0b' },
            { icon: Calendar, title: 'Active Month', value: 'December', color: '#8b5cf6' }
          ].map((stat, index) => (
            <div key={index} style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  backgroundColor: stat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 16px ${stat.color}40`
                }}>
                  <stat.icon size={24} color="white" />
                </div>
                <div>
                  <p style={{ margin: '0', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
                    {stat.title}
                  </p>
                  <p style={{ margin: '0', fontSize: '24px', fontWeight: '700', color: 'white' }}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          animation: 'fadeIn 0.8s ease-out'
        }}>
          {/* Search and Controls */}
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            marginBottom: '32px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <div style={{ 
              position: 'relative', 
              flex: '1',
              minWidth: '300px'
            }}>
              <Search 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  left: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#9ca3af' 
                }} 
              />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 20px 16px 52px',
                  border: '2px solid transparent',
                  borderRadius: '16px',
                  fontSize: '16px',
                  backgroundColor: '#f8fafc',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'transparent';
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {['Department', 'Designation', 'Month', 'Status'].map((filter) => (
                <button key={filter} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.backgroundColor = '#667eea';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.color = '#374151';
                  e.target.style.transform = 'translateY(0)';
                }}>
                  <Filter size={16} />
                  {filter}
                  <ChevronDown size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            marginBottom: '32px',
            flexWrap: 'wrap'
          }}>
            <button style={{
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.3)';
            }}>
              <Download size={16} />
              Export Data
            </button>
            <button style={{
              padding: '14px 28px',
              backgroundColor: '#ffffff',
              color: '#374151',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#667eea';
              e.target.style.color = '#667eea';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.color = '#374151';
              e.target.style.transform = 'translateY(0)';
            }}>
              Reset Filters
            </button>
          </div>

          {/* Enhanced Table */}
          <div style={{ 
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              backgroundColor: '#ffffff'
            }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
                  {['Employee', 'Designation', 'Attendance', 'Gross Salary', 'Deductions', 'Net Salary', 'Status'].map((header) => (
                    <th key={header} style={{ 
                      padding: '20px 24px', 
                      textAlign: 'left', 
                      fontSize: '14px', 
                      fontWeight: '700', 
                      color: '#1e293b', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em',
                      borderBottom: '2px solid #e2e8f0'
                    }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee, index) => (
                  <tr key={employee.id} style={{ 
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.transform = 'scale(1.01)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  onClick={() => setSelectedEmployee(employee)}>
                    {/* Employee Column */}
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '16px',
                          fontWeight: '600',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                        }}>
                          {employee.avatar}
                        </div>
                        <div>
                          <p style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                            {employee.name}
                          </p>
                          <p style={{ margin: '0', fontSize: '14px', color: '#64748b' }}>
                            {employee.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    {/* Designation */}
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{
                        display: 'inline-block',
                        padding: '6px 12px',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#475569'
                      }}>
                        {employee.designation}
                      </div>
                    </td>
                    
                    {/* Attendance */}
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: `conic-gradient(${getAttendanceColor(employee.attendanceRate)} ${employee.attendanceRate * 3.6}deg, #e2e8f0 0deg)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#1e293b'
                        }}>
                          {employee.attendanceRate}%
                        </div>
                        <div>
                          <p style={{ margin: '0', fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>
                            {employee.attendance}
                          </p>
                          <p style={{ margin: '0', fontSize: '12px', color: '#64748b' }}>
                            This month
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    {/* Gross Salary */}
                    <td style={{ 
                      padding: '20px 24px', 
                      fontSize: '16px', 
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      {employee.grossSalary}
                    </td>
                    
                    {/* Deductions */}
                    <td style={{ 
                      padding: '20px 24px', 
                      fontSize: '16px', 
                      fontWeight: '600',
                      color: '#ef4444'
                    }}>
                      {employee.deductions}
                    </td>
                    
                    {/* Net Salary */}
                    <td style={{ 
                      padding: '20px 24px', 
                      fontSize: '18px', 
                      fontWeight: '700',
                      color: '#10b981'
                    }}>
                      {employee.netSalary}
                    </td>
                    
                    {/* Status */}
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        backgroundColor: `${getStatusColor(employee.status)}20`,
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: getStatusColor(employee.status)
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: getStatusColor(employee.status)
                        }}></div>
                        {employee.status}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* CSS Animations */}
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(50px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default PayrollSystem;