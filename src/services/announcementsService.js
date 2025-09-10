/**
 * Announcements Service - Handles all announcement-related API operations
 */

import api from './api';

class AnnouncementsService {
  constructor() {
    // No need to manually handle tokens as api instance handles it
  }

  // Create a new announcement
  async createAnnouncement(joinCode, announcementData) {
    try {
      const response = await api.post(`/classes/${joinCode}/announcements`, announcementData);
      return response.data;
    } catch (error) {
      console.error('Service: Error creating announcement:', error);
      throw error;
    }
  }

  // Get announcements for a class
  async getClassAnnouncements(joinCode) {
    try {
      const response = await api.get(`/classes/${joinCode}/announcements`);
      return response.data;
    } catch (error) {
      console.error('Error fetching announcements:', error);
      throw error;
    }
  }

  // Get announcement details
  async getAnnouncementDetails(announcementId) {
    try {
      const response = await api.get(`/classes/announcements/${announcementId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching announcement details:', error);
      throw error;
    }
  }

  // Update announcement
  async updateAnnouncement(announcementId, updateData) {
    try {
      const response = await api.put(`/classes/announcements/${announcementId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  }

  // Delete announcement
  async deleteAnnouncement(announcementId) {
    try {
      const response = await api.delete(`/classes/announcements/${announcementId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  }

  // Format announcement data for display
  formatAnnouncementData(announcement) {
    return {
      id: announcement.announcement_id,
      title: announcement.title,
      content: announcement.content,
      tags: announcement.tags || [],
      sendEmail: announcement.send_email,
      createdAt: announcement.created_at,
      createdBy: announcement.creator,
      timeAgo: this.getTimeAgo(announcement.created_at)
    };
  }


  // Get time ago string
  getTimeAgo(timestamp) {
    const now = new Date();
    const created = new Date(timestamp);
    const diffInMinutes = Math.floor((now - created) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} days ago`;
    return created.toLocaleDateString();
  }

  // Calculate announcement statistics
  calculateAnnouncementStats(announcements) {
    const total = announcements.length;
    const high = announcements.filter(a => a.priority === 'high').length;
    const medium = announcements.filter(a => a.priority === 'medium').length;
    const low = announcements.filter(a => a.priority === 'low').length;
    const recent = announcements.filter(a => {
      const created = new Date(a.created_at);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return created > weekAgo;
    }).length;

    return {
      total,
      high,
      medium,
      low,
      recent
    };
  }
}

// Create and export a singleton instance
const announcementsService = new AnnouncementsService();

export default announcementsService;
