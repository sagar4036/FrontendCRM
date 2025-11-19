import React, { useState, useEffect ,useCallback} from 'react';
import {
  Users,
  UserPlus,
  Search,
  MessageCircle,
  Phone,
  Mail,
  UserCheck
} from 'lucide-react';
import '../../styles/crm-teams.css';
import { useLoading } from '../../context/LoadingContext';
import AdminSpinner from '../spinner/AdminSpinner';
import SidebarToggle from '../admin/SidebarToggle';
import { useApi } from '../../context/ApiContext';

const Team = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [teamMembersById, setTeamMembersById] = useState({});
  const [teamMembersLoading, setTeamMembersLoading] = useState({});
  const [onlineExecutives, setOnlineExecutives] = useState([]);
  const [onlineLoading, setOnlineLoading] = useState(false);

  const { isLoading, variant, showLoader, hideLoader } = useLoading();
  const {
    managerTeams,
    fetchManagerTeams,
    fetchOnlineExecutivesData,
    fetchTeamMembersById
  } = useApi();

  const isSidebarExpanded =
    localStorage.getItem('adminSidebarExpanded') === 'true';

  useEffect(() => {
    const fetchOnlineStatus = async () => {
      const data = await fetchOnlineExecutivesData();
      setOnlineExecutives(data || []);
    };
    fetchOnlineStatus();
  }, [fetchOnlineExecutivesData]);


const fetchAllTeamMembers = useCallback(async () => {
  if (!managerTeams.length) return;

  setOnlineLoading(true);
  let onlineData = [];
  try {
    console.log('Calling fetchOnlineExecutives...');
    onlineData = await fetchOnlineExecutivesData();
  } catch (error) {
    console.error('Error fetching online executives:', error);
  } finally {
    setOnlineLoading(false);
  }

  const newMembersById = {};
  const newLoading = {};

  for (let team of managerTeams) {
    newLoading[team.id] = true;
    console.log('Calling fetchTeamMembersById for team:', team.id);

    try {
      const members = await fetchTeamMembersById(team.id);
      const mappedMembers = (members || []).map((m) => ({
        id: m.id,
        username: m.username,
        email: m.email,
        role: 'Executive',
        avatar: m.profile_picture || null,
        status: onlineData.some(e => e.id === m.id) ? 'online' : 'offline'
      }));
      newMembersById[team.id] = mappedMembers;
    } catch (error) {
      console.error('❌ Error fetching team members:', error);
      newMembersById[team.id] = [];
    }
    newLoading[team.id] = false;
  }

  setTeamMembersById(newMembersById);
  setTeamMembersLoading(newLoading);
}, [managerTeams, fetchOnlineExecutivesData, fetchTeamMembersById]);

  useEffect(() => {
    const loadTeamsAndMembers = async () => {
      showLoader("Loading teams...", "admin");

      try {
        await fetchManagerTeams();
      } catch (error) {
        console.error("Error fetching manager teams:", error);
      } finally {
        hideLoader();
      }
    };

    loadTeamsAndMembers();
  }, [fetchManagerTeams, showLoader, hideLoader]);

  useEffect(() => {
    if (managerTeams.length === 0) return;

    const loadMembers = async () => {
      await fetchAllTeamMembers();
    };

    loadMembers();
  }, [managerTeams,fetchAllTeamMembers]);

  useEffect(() => {
    console.log("🟡 managerTeams updated:", managerTeams);
  }, [managerTeams]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'crm-status-online';
      case 'away':
        return 'crm-status-away';
      case 'offline':
      default:
        return 'crm-status-offline';
    }
  };

  const totalMembers = Object.values(teamMembersById).reduce(
    (acc, members) => acc + members.length,
    0
  );

  const filteredTeams = managerTeams.filter((team) => {
    const term = searchTerm.toLowerCase();
    const teamNameMatches = team.name.toLowerCase().includes(term);
    const members = teamMembersById[team.id] || [];
    const memberMatches = members.some(
      (m) =>
        m.username.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term)
    );
    return teamNameMatches || memberMatches;
  });

  return (
    <div
      className={`crm-teams-container ${
        isSidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'
      }`}
    >
      {isLoading && variant === 'admin' && (
        <AdminSpinner text="Loading teams..." />
      )}

      <SidebarToggle />

      {onlineLoading && (
        <div className="crm-loading-indicator">
          <p>Checking online statuses...</p>
        </div>
      )}

      <div className="crm-teams-header">
        <div className="crm-teams-header-top">
          <div>
            <h1 className="crm-teams-title">Team Manager</h1>
            <p className="crm-teams-subtitle">
              Manage your teams and track performance
            </p>
          </div>
        </div>

        <div className="crm-search-filter-bar">
          <div className="crm-search-container">
            <Search className="crm-search-icon" size={20} />
            <input
              type="text"
              placeholder="Search teams, usernames, emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="crm-search-input"
            />
          </div>
        </div>

        <div className="crm-stats-grid">
          <div className="crm-stat-card">
            <div className="crm-stat-content">
              <div>
                <p className="crm-stat-label">Total Teams</p>
                <p className="crm-stat-value">{managerTeams.length}</p>
              </div>
              <Users className="crm-stat-icon crm-icon-purple" size={24} />
            </div>
          </div>
          <div className="crm-stat-card">
            <div className="crm-stat-content">
              <div>
                <p className="crm-stat-label">Total Members</p>
                <p className="crm-stat-value">{totalMembers}</p>
              </div>
              <UserPlus className="crm-stat-icon crm-icon-blue" size={24} />
            </div>
          </div>
          <div className="crm-stat-card">
            <div className="crm-stat-content">
              <div>
                <p className="crm-stat-label">Online Members</p>
                <p className="crm-stat-value">{onlineExecutives.length}</p>
              </div>
              <UserCheck className="crm-stat-icon crm-icon-green" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="crm-teams-grid">
        {filteredTeams.map((team) => (
          <div key={team.id} className="crm-team-card">
            <div className="crm-team-header crm-gradient-purple-pink">
              <div className="crm-team-header-overlay"></div>
              <div className="crm-team-header-content">
                <div className="crm-team-header-top">
                  <h3 className="crm-team-name">{team.name}</h3>
                </div>
              </div>
            </div>

            <div className="crm-team-body">
              <div className="crm-members-list">
                {teamMembersLoading[team.id] ? (
                  <p>Loading members...</p>
                ) : (
                  <>
                    {(teamMembersById[team.id] || []).map((member) => (
                      <div key={member.id} className="crm-member-item">
                        <div className="crm-member-info">
                          <div className="crm-member-avatar-container">
                            <div className="crm-member-avatar">
                              {member.avatar ? (
                                <img src={member.avatar} alt="avatar" />
                              ) : (
                                '👤'
                              )}
                            </div>
                            <div
                              className={`crm-member-status ${getStatusColor(
                                member.status
                              )}`}
                            ></div>
                          </div>
                          <div className="crm-manager-detail">
                            <p>ID: {member.id}</p>
                            <p>Username: {member.username}</p>
                            <p>Email: {member.email}</p>
                            <p>Role: {member.role}</p>
                          </div>
                        </div>
                        <div className="crm-member-actions">
                          <button className="crm-action-btn">
                            <MessageCircle size={16} />
                          </button>
                          <button className="crm-action-btn">
                            <Phone size={16} />
                          </button>
                          <button className="crm-action-btn">
                            <Mail size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Team;
