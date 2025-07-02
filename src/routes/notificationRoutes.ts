

import express from "express"
import { markAsRead, deleteNotification, getUserNotifications } from "../controllers/notificationController"

const router = express.Router()

router.get("/getallnot/:email", getUserNotifications);
router.delete("/deletenot/:notificationId", deleteNotification);
router.patch("/markasRead", markAsRead)

export default router