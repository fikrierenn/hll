import usersData from './users.json';
import leadsData from './leads.json';
import leadEventsData from './lead-events.json';
import performanceData from './performance.json';

// Simulate async API calls with delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const mockApi = {
  // Users
  async getUsers() {
    await delay(300);
    return usersData;
  },

  async getUserById(id: string) {
    await delay(200);
    return usersData.find(user => user.id === id);
  },

  async getUsersByRole(role: string) {
    await delay(300);
    return usersData.filter(user => user.role === role);
  },

  async getUsersByLeaderId(leaderId: string) {
    await delay(300);
    return usersData.filter(user => user.leader_id === leaderId);
  },

  // Leads
  async getLeads() {
    await delay(400);
    return leadsData;
  },

  async getLeadById(id: string) {
    await delay(200);
    return leadsData.find(lead => lead.id === id);
  },

  async getLeadsByAssignedTo(userId: string) {
    await delay(400);
    return leadsData.filter(lead => lead.assigned_to === userId);
  },

  async getLeadsByStatus(status: string) {
    await delay(400);
    return leadsData.filter(lead => lead.status === status);
  },

  async updateLeadStatus(leadId: string, newStatus: string) {
    await delay(300);
    const lead = leadsData.find(l => l.id === leadId);
    if (lead) {
      lead.status = newStatus as any;
    }
    return lead;
  },

  // Lead Events
  async getLeadEvents() {
    await delay(300);
    return leadEventsData;
  },

  async getLeadEventsByLeadId(leadId: string) {
    await delay(300);
    return leadEventsData.filter(event => event.lead_id === leadId);
  },

  async createLeadEvent(event: {
    lead_id: string;
    event_type: string;
    actor_id: string | null;
    metadata?: any;
  }) {
    await delay(200);
    const newEvent = {
      id: `event-${Date.now()}`,
      ...event,
      timestamp: new Date().toISOString(),
    };
    leadEventsData.push(newEvent as any);
    return newEvent;
  },

  // Performance
  async getPerformance() {
    await delay(400);
    return performanceData;
  },

  async getPerformanceByUserId(userId: string) {
    await delay(300);
    return performanceData.filter(perf => perf.user_id === userId);
  },

  async getPerformanceByDate(date: string) {
    await delay(300);
    return performanceData.filter(perf => perf.date === date);
  },

  // Dashboard KPIs
  async getDashboardKPIs(userId: string, role: string, date?: string) {
    await delay(400);
    
    let relevantLeads = leadsData;
    
    // Filter based on role
    if (role === 'representative') {
      relevantLeads = leadsData.filter(lead => lead.assigned_to === userId);
    } else if (role === 'leader') {
      const teamMembers = usersData.filter(user => user.leader_id === userId);
      const teamMemberIds = teamMembers.map(m => m.id);
      relevantLeads = leadsData.filter(lead => lead.assigned_to && teamMemberIds.includes(lead.assigned_to));
    }
    
    // Filter by date if provided
    if (date) {
      relevantLeads = relevantLeads.filter(lead => 
        lead.assigned_at?.startsWith(date)
      );
    }
    
    const totalLeads = relevantLeads.length;
    const contactedLeads = relevantLeads.filter(l => 
      ['contacted', 'converted'].includes(l.status)
    ).length;
    const convertedLeads = relevantLeads.filter(l => l.status === 'converted').length;
    
    // Calculate average response time
    const leadsWithEvents = relevantLeads.map(lead => {
      const events = leadEventsData.filter(e => e.lead_id === lead.id);
      const assignedEvent = events.find(e => e.event_type === 'assigned');
      const calledEvent = events.find(e => e.event_type === 'called');
      
      if (assignedEvent && calledEvent) {
        const assignedTime = new Date(assignedEvent.timestamp).getTime();
        const calledTime = new Date(calledEvent.timestamp).getTime();
        return (calledTime - assignedTime) / (1000 * 60); // minutes
      }
      return null;
    }).filter(time => time !== null) as number[];
    
    const avgResponseMinutes = leadsWithEvents.length > 0
      ? leadsWithEvents.reduce((a, b) => a + b, 0) / leadsWithEvents.length
      : 0;
    
    const salesRatio = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    
    return {
      total_leads: totalLeads,
      contacted_leads: contactedLeads,
      converted_leads: convertedLeads,
      avg_response_minutes: Math.round(avgResponseMinutes * 10) / 10,
      sales_ratio: Math.round(salesRatio * 10) / 10,
    };
  },

  // Team Performance
  async getTeamPerformance(leaderId: string, startDate?: string, endDate?: string) {
    await delay(500);
    
    const teamMembers = usersData.filter(user => user.leader_id === leaderId);
    
    const performance = teamMembers.map(member => {
      let memberLeads = leadsData.filter(lead => lead.assigned_to === member.id);
      
      // Filter by date range if provided
      if (startDate && endDate) {
        memberLeads = memberLeads.filter(lead => {
          const assignedDate = lead.assigned_at?.split('T')[0];
          return assignedDate && assignedDate >= startDate && assignedDate <= endDate;
        });
      }
      
      const totalLeads = memberLeads.length;
      const contactedLeads = memberLeads.filter(l => 
        ['contacted', 'converted'].includes(l.status)
      ).length;
      const convertedLeads = memberLeads.filter(l => l.status === 'converted').length;
      
      // Calculate average response time
      const leadsWithEvents = memberLeads.map(lead => {
        const events = leadEventsData.filter(e => e.lead_id === lead.id);
        const assignedEvent = events.find(e => e.event_type === 'assigned');
        const calledEvent = events.find(e => e.event_type === 'called');
        
        if (assignedEvent && calledEvent) {
          const assignedTime = new Date(assignedEvent.timestamp).getTime();
          const calledTime = new Date(calledEvent.timestamp).getTime();
          return (calledTime - assignedTime) / (1000 * 60);
        }
        return null;
      }).filter(time => time !== null) as number[];
      
      const avgResponseMinutes = leadsWithEvents.length > 0
        ? leadsWithEvents.reduce((a, b) => a + b, 0) / leadsWithEvents.length
        : 0;
      
      const salesRatio = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
      
      return {
        representative_id: member.id,
        representative_name: member.name,
        total_leads: totalLeads,
        contacted_leads: contactedLeads,
        converted_leads: convertedLeads,
        avg_response_minutes: Math.round(avgResponseMinutes * 10) / 10,
        sales_ratio: Math.round(salesRatio * 10) / 10,
      };
    });
    
    return performance;
  },
};

// Export data for direct access if needed
export { usersData, leadsData, leadEventsData, performanceData };
