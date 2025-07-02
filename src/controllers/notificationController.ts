


import { Request, Response } from "express";
import Notification from "../models/Notification";

// Get all notifications for a specific user
export const getUserNotifications = async (req: Request, res: Response) => {
    try {
      // Extract userId from query or request (assume authenticated user's ID comes from req.user if using auth middleware)
      // const userId = req.params.userId;

      // // Find all notifications for this user, sorted by newest first
      // const notifications = await Notification.find({ userId }).sort({
      //   createdAt: -1,
      // });

      // ✅ UPDATED: (based on user email)
      const userEmail = req.params.email;
      const notifications = await Notification.find({ userId: userEmail }).sort(
        { createdAt: -1 }
      );
      // Return them in the response
      return void res.status(200).json({ notifications });
    } catch (error) {
      console.error("❌ Error fetching notifications:", error);
      return void res.status(500).json({ error: "Server error fetching notifications" });
    }
  };

  

  // Mark one or more notifications as read
export const markAsRead = async (req: Request, res: Response) => {
    try {
      // Extract notification IDs from the request body (can be one or many)
      const { notificationIds } = req.body;
  
      // Validate the input
      if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        return void res.status(400).json({ error: "No notification IDs provided" });
      }
  
      // Update all matching notifications, setting isRead = true
      await Notification.updateMany(
        { _id: { $in: notificationIds } },
        { $set: { isRead: true } }
      );
  
      // Respond with success
      return void res.status(200).json({ message: "Notifications marked as read" });
    } catch (error) {
      console.error("❌ Error marking notifications as read:", error);
      return void res.status(500).json({ error: "Server error updating notifications" });
    }
  };

  

  // Delete a specific notification
export const deleteNotification = async (req: Request, res: Response) => {
    try {
      // Get the notification ID from URL params
      //const { _id } = req.params;
      const { notificationId } = req.params;

      // Delete the notification document
      //await Notification.findByIdAndDelete(_id);
      await Notification.findByIdAndDelete(notificationId);

      // Respond with success
      return void res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
      console.error("❌ Error deleting notification:", error);
      return void res.status(500).json({ error: "Server error deleting notification" });
    }
  };
  